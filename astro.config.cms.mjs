import { mergeConfig } from 'astro/config';
import { createDocsConfig } from './astro.config.mjs';
import { createEmDashConfig, emdashStarlightOptions } from './config/EmDash.mjs';

export default mergeConfig(createDocsConfig(emdashStarlightOptions), createEmDashConfig());
