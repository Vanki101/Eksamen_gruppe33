import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Eksamen_gruppe33',

  projectId: 'pkxoe8e3',
  dataset: 'eksamen2025',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
