import { compileQuery, queryBuilder } from "@tanstack/db"
import { createEffect, createMemo, createSignal } from "solid-js"
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
  const [restart, forceRestart] = createSignal(0, {
    name: `RestartQuerySignal`,
  })

  const compiledQuery = createMemo(
    () => {
      restart()
      const query = queryFn(queryBuilder())
      const compiled = compileQuery(query)
      compiled.start()
      return compiled
    },
    undefined,
    { name: `CompiledQuery` }
  )

  // For some reason this does not update reactively
  // const state = useStore(compiledQuery().results.derivedState)
  // const data = useStore(compiledQuery().results.derivedArray)
  const state = () => compiledQuery().results.derivedState.state
  const data = () => compiledQuery().results.derivedArray.state

  // Clean up on unmount
  createEffect(
    () => {
      if (compiledQuery().state === `stopped`) {
        forceRestart((count) => {
          return (count += 1)
        })
      }

      return () => {
        compiledQuery().stop()
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
