import { useQuery } from "react-query";
import axios from "axios";
axios.defaults.timeout = 15000;

function fetchPromise(url: string) {
  return () => axios.get(url).then((res) => res.data);
}
export default function useAxios(
  key: string | any[],
  url: string,
  enabled: boolean
) {
  const { data, isLoading, isSuccess } = useQuery({
    queryKey: key,
    queryFn: fetchPromise(url),
    enabled,
  });
  if (!enabled) {
    return { data: {}, isLoading: false, isSuccess: true };
  }
  return { data, isLoading, isSuccess };
}
