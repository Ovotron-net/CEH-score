<<<<<<< Updated upstream
import {defineConfig} from 'orval';
=======
<<<<<<< HEAD
import { defineConfig } from 'orval';
>>>>>>> Stashed changes

export default defineConfig({
    cehScore: {
        input: {
            target: './openapi.yaml',
        },
        output: {
            mode: 'tags-split',
            target: 'src/api/generated',
            schemas: 'src/api/generated/model',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/mutator.ts',
                    name: 'customFetch',
                },
                query: {
                    useQuery: true,
                    useMutation: true,
                },
            },
        },
    },
<<<<<<< Updated upstream
=======
  },
=======
import {defineConfig} from 'orval';

export default defineConfig({
    cehScore: {
        input: {
            target: './openapi.yaml',
        },
        output: {
            mode: 'tags-split',
            target: 'src/api/generated',
            schemas: 'src/api/generated/model',
            client: 'react-query',
            override: {
                mutator: {
                    path: './src/api/mutator.ts',
                    name: 'customFetch',
                },
                query: {
                    useQuery: true,
                    useMutation: true,
                },
            },
        },
    },
>>>>>>> origin/claude/build
>>>>>>> Stashed changes
});
