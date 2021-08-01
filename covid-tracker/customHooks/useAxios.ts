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
  return { data, isLoading, isSuccess };
}
