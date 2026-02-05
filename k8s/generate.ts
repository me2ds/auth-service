/**
 * Generate Kubernetes YAML manifests from TypeScript configuration
 * Usage: bun run k8s/generate.ts [environment]
 * Outputs: k8s/dist/*.yaml
 */

import { App } from 'cdk8s';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { DesmeAudioChart, getConfig } from './config.ts';

async function generate() {
  const environment = Bun.env.K8S_ENV || process.argv[2] || 'production';
  const outputDir = './k8s/dist';

  console.log(`\n🔨 Generating Kubernetes manifests for: ${environment}`);
  console.log(`📁 Output directory: ${outputDir}\n`);

  // Create output directory
  mkdirSync(outputDir, { recursive: true });

  try {
    // Create CDK8s App
    const app = new App({
      outdir: outputDir,
      yamlOutputFormat: 'all-resources', // Output single file with all resources
    });

    // Get environment-specific configuration
    const config = getConfig(environment);

    // Create chart
    new DesmeAudioChart(app, 'desme-audio', config);

    // Synthesize (generates manifest)
    app.synth();

    // Also save config for reference
    const configJson = JSON.stringify(config, null, 2);
    writeFileSync(`${outputDir}/config.${environment}.json`, configJson);

    console.log('✅ Manifests generated successfully!\n');
    console.log(`📄 Files created:`);
    console.log(`  • ${outputDir}/desme-audio.k8s.yaml`);
    console.log(`  • ${outputDir}/config.${environment}.json\n`);

    console.log('🚀 Deploy with:');
    console.log(`  kubectl apply -f ${outputDir}/desme-audio.k8s.yaml\n`);

    // Print deployment info
    console.log('📊 Deployment Configuration:');
    console.log(`  Environment: ${config.namespace}`);
    console.log(`  Application: ${config.appName}`);
    console.log(`  Image: ${config.image}`);
    console.log(`  Replicas: ${config.minReplicas}-${config.maxReplicas}`);
    console.log(`  Domain: ${config.domain}\n`);
  } catch (error) {
    console.error('❌ Error generating manifests:');
    console.error(error);
    process.exit(1);
  }
}

// Run
generate();
