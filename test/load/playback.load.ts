import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Thresholds define the success criterias
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up from 0 to 20 users
    { duration: '1m30s', target: 100 }, // Ramp-up to 100 users
    { duration: '2m', target: 100 }, // Stay at 100 users
    { duration: '30s', target: 0 }, // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% of requests should be <500ms, 99% <1000ms
    http_req_failed: ['rate<0.1'], // Error rate should be <10%
    playback_success_rate: ['rate>0.95'], // Success rate >95%
  },
};

// Custom metrics
const playbackSuccessRate = new Rate('playback_success_rate');
const authDuration = new Trend('auth_duration');
const roomJoinDuration = new Trend('room_join_duration');
const messagePostDuration = new Trend('message_post_duration');
const errorCounter = new Counter('errors');
const activeUsers = new Gauge('active_users');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  activeUsers.add(1);

  try {
    // Simulate user authentication
    group('Authentication', () => {
      const authStartTime = new Date();
      const authRes = http.post(`${BASE_URL}/user/auth/github`, {
        code: 'test-code-' + Math.random(),
      });

      authDuration.add(new Date() - authStartTime);

      check(authRes, {
        'auth status is 200 or 400': (r) =>
          r.status === 200 || r.status === 400,
      }) || errorCounter.add(1);
    });

    sleep(1);

    // Get user profile
    group('Get Profile', () => {
      const token = 'test-token-' + Math.random();
      const profileRes = http.get(`${BASE_URL}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      check(profileRes, {
        'profile status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      }) || errorCounter.add(1);
    });

    sleep(1);

    // Join room simulation
    group('Room Operations', () => {
      const token = 'test-token-' + Math.random();

      // Get rooms
      const roomsRes = http.get(`${BASE_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      check(roomsRes, {
        'get rooms status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      }) || errorCounter.add(1);

      // If we got rooms, try joining one
      if (roomsRes.status === 200) {
        const joinStartTime = new Date();
        const roomId = `test-room-${Math.floor(Math.random() * 10)}`;

        const joinRes = http.post(
          `${BASE_URL}/rooms/${roomId}/members/${Math.random()}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        roomJoinDuration.add(new Date() - joinStartTime);
        playbackSuccessRate.add(joinRes.status < 400);

        check(joinRes, {
          'join room status is 200, 400, or 401': (r) =>
            r.status === 200 || r.status === 400 || r.status === 401,
        }) || errorCounter.add(1);
      }
    });

    sleep(1);

    // Message posting
    group('Messages', () => {
      const token = 'test-token-' + Math.random();
      const roomId = `test-room-${Math.floor(Math.random() * 10)}`;

      const messageStartTime = new Date();
      const messageRes = http.post(
        `${BASE_URL}/messages`,
        {
          roomId: roomId,
          content: `Test message ${Date.now()}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      messagePostDuration.add(new Date() - messageStartTime);
      playbackSuccessRate.add(messageRes.status < 400);

      check(messageRes, {
        'post message status is 201, 400, or 401': (r) =>
          r.status === 201 || r.status === 400 || r.status === 401,
      }) || errorCounter.add(1);
    });

    sleep(1);

    // Composition upload simulation
    group('Compositions', () => {
      const token = 'test-token-' + Math.random();

      const compositionRes = http.get(`${BASE_URL}/composition`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      check(compositionRes, {
        'get compositions status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      }) || errorCounter.add(1);
    });

    sleep(1);

    // Friends operations
    group('Friends', () => {
      const token = 'test-token-' + Math.random();

      const friendsRes = http.get(`${BASE_URL}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      check(friendsRes, {
        'get friends status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      }) || errorCounter.add(1);
    });

    sleep(1);

    // Playback history
    group('Playback History', () => {
      const token = 'test-token-' + Math.random();

      const historyRes = http.get(`${BASE_URL}/playback-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      check(historyRes, {
        'get history status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      }) || errorCounter.add(1);

      const topPlayedRes = http.get(
        `${BASE_URL}/playback-history/top-played?limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      check(topPlayedRes, {
        'get top-played status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      }) || errorCounter.add(1);
    });

    sleep(2);
  } finally {
    activeUsers.add(-1);
  }
}
