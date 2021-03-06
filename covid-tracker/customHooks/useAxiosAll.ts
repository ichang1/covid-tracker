import { useQueries } from "react-query";
import axios from "axios";
axios.defaults.timeout = 15000;

function fetchPromise(url: string) {
  return async () => {
    try {
      const { data } = await axios.get(url);
      return data;
    } catch (err) {
      return err;
    }
  };
}

interface QueryOptions {
  key: string | any[];
  url: string;
  enabled: boolean;
}

//24 hours
const staleTime = 8.64 * 10 ** 7;
const retry = 5;

export default function useAxios(queryOptions: QueryOptions[]) {
  const queryResults = useQueries(
    queryOptions.map(({ key, url, enabled }) => ({
      queryKey: key,
      queryFn: fetchPromise(url),
      enabled,
      staleTime,
      retry,
    }))
  );
  const enabled = !queryOptions.some((queryOpt) => !queryOpt.enabled);
  if (!enabled) {
    return { data: {}, isLoading: false, isSuccess: true };
  }
  const isLoading = queryResults.some((query) => query.isLoading);
  const data = queryResults.reduce(
    (_data, query, idx) => ({ ..._data, [queryOptions[idx].url]: query.data }),
    {}
  );
  const isSuccess = queryResults.every((query) => query.isSuccess);
  const allError = queryResults.some((query) => query.isError);
  const someError = !isSuccess;
  return { data, isLoading, isSuccess, allError, someError };
}
