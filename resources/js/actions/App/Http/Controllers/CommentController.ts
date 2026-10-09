import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\CommentController::store
* @see app/Http/Controllers/CommentController.php:16
* @route '/g/{group}/expenses/{expense}/comments'
*/
export const store = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/g/{group}/expenses/{expense}/comments',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\CommentController::store
* @see app/Http/Controllers/CommentController.php:16
* @route '/g/{group}/expenses/{expense}/comments'
*/
store.url = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            expense: args[1],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
    }

    return store.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{expense}', parsedArgs.expense.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CommentController::store
* @see app/Http/Controllers/CommentController.php:16
* @route '/g/{group}/expenses/{expense}/comments'
*/
store.post = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CommentController::store
* @see app/Http/Controllers/CommentController.php:16
* @route '/g/{group}/expenses/{expense}/comments'
*/
const storeForm = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CommentController::store
* @see app/Http/Controllers/CommentController.php:16
* @route '/g/{group}/expenses/{expense}/comments'
*/
storeForm.post = (args: { group: string | { slug: string }, expense: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(args, options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\CommentController::destroy
* @see app/Http/Controllers/CommentController.php:31
* @route '/g/{group}/expenses/{expense}/comments/{comment}'
*/
export const destroy = (args: { group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/g/{group}/expenses/{expense}/comments/{comment}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\CommentController::destroy
* @see app/Http/Controllers/CommentController.php:31
* @route '/g/{group}/expenses/{expense}/comments/{comment}'
*/
destroy.url = (args: { group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions) => {
    if (Array.isArray(args)) {
        args = {
            group: args[0],
            expense: args[1],
            comment: args[2],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        group: typeof args.group === 'object'
        ? args.group.slug
        : args.group,
        expense: typeof args.expense === 'object'
        ? args.expense.id
        : args.expense,
        comment: typeof args.comment === 'object'
        ? args.comment.id
        : args.comment,
    }

    return destroy.definition.url
            .replace('{group}', parsedArgs.group.toString())
            .replace('{expense}', parsedArgs.expense.toString())
            .replace('{comment}', parsedArgs.comment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\CommentController::destroy
* @see app/Http/Controllers/CommentController.php:31
* @route '/g/{group}/expenses/{expense}/comments/{comment}'
*/
destroy.delete = (args: { group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\CommentController::destroy
* @see app/Http/Controllers/CommentController.php:31
* @route '/g/{group}/expenses/{expense}/comments/{comment}'
*/
const destroyForm = (args: { group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\CommentController::destroy
* @see app/Http/Controllers/CommentController.php:31
* @route '/g/{group}/expenses/{expense}/comments/{comment}'
*/
destroyForm.delete = (args: { group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } } | [group: string | { slug: string }, expense: number | { id: number }, comment: number | { id: number } ], options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const CommentController = { store, destroy }

export default CommentController