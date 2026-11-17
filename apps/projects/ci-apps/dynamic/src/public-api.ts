/*
 * Public API Surface of dynamic
 */
export { CiApplicationModule } from './lib/ci-application/ci-application.module';
export { HomeComponent } from './lib/ci-application/home/home.component';
export { BlocksBuilderComponent } from './lib/blocks-builder/blocks-builder.component';
export type {
    BlockInputType,
    BlockComponentInputOption,
    BlockComponentInputSchema,
    DynamicComponentDefinition,
    DynamicBlockNode,
    DynamicBlockSpecification,
} from './lib/blocks-builder/blocks-builder.models';
export { DYNAMIC_DEFAULT_COMPONENTS } from './lib/blocks-builder/default-components';
