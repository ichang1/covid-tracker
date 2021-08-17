import { useQuery } from "react-query";
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
//24 hours
const staleTime = 8.64 * 10 ** 7;
const retry = 5;
export default function useAxios(
  key: string | any[],
  url: string,
  enabled: boolean
) {
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: key,
    queryFn: fetchPromise(url),
    enabled,
    staleTime,
    retry,
  });
  if (!enabled) {
    return { data: {}, isLoading: false, isSuccess: true };
  }
  return { data, isLoading, isSuccess };
}
