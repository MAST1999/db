import { compileQuery, queryBuilder } from "@tanstack/db"
import { createEffect, createMemo } from "solid-js"
import type { Accessor } from "solid-js"
import type {
  Collection,
  Context,
  InitialQueryBuilder,
  QueryBuilder,
  ResultsFromContext,
  Schema,
} from "@tanstack/db"

export interface UseLiveQueryReturn<T extends object> {
  state: Accessor<Map<string, T>>
  data: Accessor<Array<T>>
  collection: Accessor<Collection<T>>
}

export function useLiveQuery<
  TResultContext extends Context<Schema> = Context<Schema>,
>(
  queryFn: (
    q: InitialQueryBuilder<Context<Schema>>
  ) => QueryBuilder<TResultContext>
): UseLiveQueryReturn<ResultsFromContext<TResultContext>> {
  const compiledQuery = createMemo(
    () => {
      const query = queryFn(queryBuilder())
      const compiled = compileQuery(query)
      compiled.start()
      return compiled
    },
    undefined,
    { name: `CompiledQueryMemo` }
  )

  // TODO: Solid useStore needs to be updated to optionally
  // receive a getter to receive updates from compiledQuery.
  // For now, doing this should work and be reactive with updates
  const state = () => compiledQuery().results.derivedState.state
  const data = () => compiledQuery().results.derivedArray.state

  // Clean up on unmount
  createEffect(
    () => {
      const c = compiledQuery()

      return () => {
        c.stop()
      }
    },
    undefined,
    { name: `ResetQueryEffect` }
  )

  const collection = createMemo(() => compiledQuery().results, undefined, {
    name: `CollectionMemo`,
  })

  return {
    state,
    data,
    collection,
  }
}
