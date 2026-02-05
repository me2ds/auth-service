import http from 'k6/http';
import { check, group } from 'k6';
import { Rate } from 'k6/metrics';

export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 50 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const successRate = new Rate('success_rate');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Realistic user-like behavior
export default function () {
  const token = `test-token-${Math.random()}`;
  const roomId = `room-${Math.floor(Math.random() * 10)}`;
  const userId = `user-${Math.floor(Math.random() * 100)}`;

  group('WebSocket-Like Playback Sync', () => {
    // Simulate periodic playback updates
    for (let i = 0; i < 3; i++) {
      const updateRes = http.patch(
        `${BASE_URL}/rooms/${roomId}/playback`,
        {
          isPlaying: Math.random() > 0.5,
          currentPosition: Math.floor(Math.random() * 300),
          currentTrackIndex: Math.floor(Math.random() * 50),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const success = updateRes.status < 400;
      successRate.add(success);

      check(updateRes, {
        'update playback is successful': (r) => r.status < 400,
        'response time < 200ms': (r) => r.timings.duration < 200,
      });
    }
  });

  group('Concurrent Room Access', () => {
    const requests = [
      {
        method: 'GET',
        url: `${BASE_URL}/rooms/${roomId}`,
        params: {
          headers: { Authorization: `Bearer ${token}` },
        },
      },
      {
        method: 'GET',
        url: `${BASE_URL}/rooms/${roomId}/members`,
        params: {
          headers: { Authorization: `Bearer ${token}` },
        },
      },
      {
        method: 'GET',
        url: `${BASE_URL}/messages/room/${roomId}?limit=20`,
        params: {
          headers: { Authorization: `Bearer ${token}` },
        },
      },
    ];

    const responses = http.batch(requests);

    responses.forEach((response) => {
      const success = response.status < 400;
      successRate.add(success);

      check(response, {
        'status is success': (r) => r.status < 400,
        'no body errors': (r) => !r.body.includes('error'),
      });
    });
  });
}
