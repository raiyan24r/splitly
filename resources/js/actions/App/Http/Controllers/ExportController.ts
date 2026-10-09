import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
const ExportController = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ExportController.url(args, options),
    method: 'get',
})

ExportController.definition = {
    methods: ["get","head"],
    url: '/g/{group}/export.csv',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
ExportController.url = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { group: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'slug' in args) {
        args = { group: args.slug }
    }

    if (Array.isArray(args)) {
        args = {
            group: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
    }

    return ExportController.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
ExportController.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: ExportController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
ExportController.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: ExportController.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
const ExportControllerForm = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ExportController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
ExportControllerForm.get = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ExportController.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\ExportController::__invoke
* @see app/Http/Controllers/ExportController.php:17
* @route '/g/{group}/export.csv'
*/
ExportControllerForm.head = (args: { group: string | { slug: string } } | [group: string | { slug: string } ] | string | { slug: string }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: ExportController.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

ExportController.form = ExportControllerForm

export default ExportController