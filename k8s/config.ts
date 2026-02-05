/**
 * Kubernetes Configuration in TypeScript
 * Generated YAML manifests at: k8s/dist/
 * Deploy with: kubectl apply -f k8s/dist/
 */

import { App, Chart } from 'cdk8s';
import { Construct } from 'constructs';
import * as kplus from 'cdk8s-plus-28';
import * as k8s from 'cdk8s';

/**
 * Environment Specific Configuration
 */
export interface KubernetesConfig {
  namespace: string;
  appName: string;
  image: string;
  replicas: number;
  minReplicas: number;
  maxReplicas: number;
  cpuRequest: string;
  memoryRequest: string;
  cpuLimit: string;
  memoryLimit: string;
  env: Record<string, string>;
  secrets: Record<string, string>;
  domain: string;
}

/**
 * Load environment-specific configuration
 */
export function getConfig(
  environment: string = 'production',
): KubernetesConfig {
  const baseConfig: KubernetesConfig = {
    namespace: 'default',
    appName: 'desme-audio-api',
    image: 'desme-audio-api:latest',
    replicas: 3,
    minReplicas: 3,
    maxReplicas: 10,
    cpuRequest: '256m',
    memoryRequest: '512Mi',
    cpuLimit: '1000m',
    memoryLimit: '1Gi',
    domain: 'desme.app',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      STORAGE_TYPE: 's3',
      AWS_REGION: 'us-west-2',
      RATE_LIMIT_WINDOW_MS: '900000',
      RATE_LIMIT_MAX_REQUESTS: '100',
    },
    secrets: {
      JWT_SECRET: 'your-jwt-secret',
      AWS_ACCESS_KEY_ID: 'your-aws-key',
      AWS_SECRET_ACCESS_KEY: 'your-aws-secret',
    },
  };

  // Development overrides
  if (environment === 'development') {
    return {
      ...baseConfig,
      namespace: 'dev',
      replicas: 1,
      minReplicas: 1,
      maxReplicas: 3,
      cpuRequest: '100m',
      memoryRequest: '256Mi',
      env: {
        ...baseConfig.env,
        NODE_ENV: 'development',
        LOG_LEVEL: 'debug',
      },
    };
  }

  // Staging overrides
  if (environment === 'staging') {
    return {
      ...baseConfig,
      namespace: 'staging',
      replicas: 2,
      minReplicas: 2,
      maxReplicas: 5,
      env: {
        ...baseConfig.env,
        NODE_ENV: 'staging',
        LOG_LEVEL: 'info',
      },
    };
  }

  return baseConfig;
}

/**
 * Main Kubernetes Chart
 */
export class DesmeAudioChart extends Chart {
  constructor(scope: Construct, id: string, config: KubernetesConfig) {
    super(scope, id, {
      namespace: config.namespace,
    });

    // ServiceAccount and RBAC
    this.createRBAC(config);

    // ConfigMap for non-sensitive configuration
    this.createConfigMap(config);

    // Secret for sensitive data
    this.createSecrets(config);

    // Deployment
    this.createDeployment(config);

    // Service
    this.createService(config);

    // Ingress
    this.createIngress(config);

    // HPA (Horizontal Pod Autoscaler)
    this.createHPA(config);

    // Network Policy
    this.createNetworkPolicy(config);
  }

  private createRBAC(config: KubernetesConfig) {
    // ServiceAccount
    const sa = new kplus.ServiceAccount(this, 'sa', {
      metadata: {
        name: config.appName,
      },
    });

    // Role
    new k8s.KubeRole(this, 'role', {
      metadata: {
        name: config.appName,
      },
      rules: [
        {
          apiGroups: [''],
          resources: ['configmaps'],
          verbs: ['get', 'list', 'watch'],
        },
        {
          apiGroups: [''],
          resources: ['secrets'],
          verbs: ['get'],
        },
      ],
    });

    // RoleBinding
    new k8s.KubeRoleBinding(this, 'role-binding', {
      metadata: {
        name: config.appName,
      },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'Role',
        name: config.appName,
      },
      subjects: [
        {
          kind: 'ServiceAccount',
          name: config.appName,
          namespace: config.namespace,
        },
      ],
    });

    return sa;
  }

  private createConfigMap(config: KubernetesConfig) {
    new kplus.ConfigMap(this, 'config', {
      metadata: {
        name: `${config.appName}-config`,
      },
      data: config.env,
    });
  }

  private createSecrets(config: KubernetesConfig) {
    new kplus.Secret(this, 'secrets', {
      metadata: {
        name: `${config.appName}-secrets`,
      },
      stringData: config.secrets,
    });
  }

  private createDeployment(config: KubernetesConfig) {
    const deployment = new kplus.Deployment(this, 'deployment', {
      metadata: {
        name: config.appName,
        labels: {
          app: config.appName,
        },
      },
      replicas: config.replicas,
      serviceAccount: new kplus.ServiceAccount(this, 'deployment-sa', {
        metadata: { name: config.appName },
      }),
    });

    const container = deployment.addContainer({
      image: config.image,
      port: 8000,
      resources: {
        requests: {
          cpu: kplus.Cpu.millis(parseInt(config.cpuRequest, 10)),
          memory: kplus.MemoryLimit.mebibytes(
            parseInt(config.memoryRequest, 10),
          ),
        },
        limits: {
          cpu: kplus.Cpu.millis(parseInt(config.cpuLimit, 10)),
          memory: kplus.MemoryLimit.mebibytes(parseInt(config.memoryLimit, 10)),
        },
      },
    });

    // Add environment variables from ConfigMap
    Object.entries(config.env).forEach(([key, value]) => {
      container.env.addVariable(
        key,
        kplus.EnvValue.fromConfigMap(
          kplus.ConfigMap.fromConfigMapName(
            this,
            `config-${key}`,
            `${config.appName}-config`,
          ),
          key,
        ),
      );
    });

    // Add secrets
    Object.entries(config.secrets).forEach(([key]) => {
      container.env.addVariable(
        key,
        kplus.EnvValue.fromSecretValue({
          key,
          secret: kplus.Secret.fromSecretName(
            this,
            `secret-${key}`,
            `${config.appName}-secrets`,
          ),
        }),
      );
    });

    // Health checks
    container.setLivenessProbe(
      kplus.Probe.fromHttpGet('/health', { port: 8000 }),
      {
        failureThreshold: 3,
        initialDelaySeconds: 30,
        periodSeconds: 10,
        timeoutSeconds: 5,
      },
    );

    container.setReadinessProbe(
      kplus.Probe.fromHttpGet('/health/ready', { port: 8000 }),
      {
        failureThreshold: 2,
        initialDelaySeconds: 10,
        periodSeconds: 5,
        timeoutSeconds: 3,
      },
    );

    // Security context
    deployment.podMetadata?.addLabel('app', config.appName);
  }

  private createService(config: KubernetesConfig) {
    const service = new kplus.Service(this, 'service', {
      metadata: {
        name: config.appName,
        labels: {
          app: config.appName,
        },
      },
      selector: kplus.Pods.select(this, 'pod-selector', {
        labels: { app: config.appName },
      }),
      ports: [
        {
          name: 'http',
          protocol: kplus.Protocol.TCP,
          port: 80,
          targetPort: 8000,
        },
      ],
      type: kplus.ServiceType.CLUSTER_IP,
    });

    return service;
  }

  private createIngress(config: KubernetesConfig) {
    new k8s.KubeIngress(this, 'ingress', {
      metadata: {
        name: `${config.appName}-ingress`,
        annotations: {
          'kubernetes.io/ingress.class': 'nginx',
          'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
          'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
          'nginx.ingress.kubernetes.io/rate-limit': '100',
        },
      },
      spec: {
        tls: [
          {
            hosts: [`api.${config.domain}`, config.domain],
            secretName: `${config.appName}-tls`,
          },
        ],
        rules: [
          {
            host: `api.${config.domain}`,
            http: {
              paths: [
                {
                  path: '/',
                  pathType: 'Prefix',
                  backend: {
                    service: {
                      name: config.appName,
                      port: {
                        number: 80,
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    });
  }

  private createHPA(config: KubernetesConfig) {
    new k8s.KubeHorizontalPodAutoscaler(this, 'hpa', {
      metadata: {
        name: `${config.appName}-hpa`,
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: config.appName,
        },
        minReplicas: config.minReplicas,
        maxReplicas: config.maxReplicas,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: 70,
              },
            },
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageUtilization: 80,
              },
            },
          },
        ],
        behavior: {
          scaleUp: {
            stabilizationWindowSeconds: 60,
            policies: [
              {
                type: 'Percent',
                value: 100,
                periodSeconds: 60,
              },
              {
                type: 'Pods',
                value: 4,
                periodSeconds: 60,
              },
            ],
            selectPolicy: 'Max',
          },
          scaleDown: {
            stabilizationWindowSeconds: 300,
            policies: [
              {
                type: 'Percent',
                value: 50,
                periodSeconds: 60,
              },
              {
                type: 'Pods',
                value: 2,
                periodSeconds: 60,
              },
            ],
            selectPolicy: 'Min',
          },
        },
      },
    });
  }

  private createNetworkPolicy(config: KubernetesConfig) {
    new k8s.KubeNetworkPolicy(this, 'network-policy', {
      metadata: {
        name: `${config.appName}-network-policy`,
      },
      spec: {
        podSelector: {
          matchLabels: {
            app: config.appName,
          },
        },
        policyTypes: ['Ingress', 'Egress'],
        ingress: [
          {
            from: [
              {
                namespaceSelector: {
                  matchLabels: {
                    name: 'ingress-nginx',
                  },
                },
              },
            ],
            ports: [
              {
                protocol: 'TCP',
                port: 8000,
              },
            ],
          },
        ],
        egress: [
          {
            to: [{ namespaceSelector: {} }],
            ports: [
              {
                protocol: 'TCP',
                port: 443,
              },
            ],
          },
        ],
      },
    });
  }
}
