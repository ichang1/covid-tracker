import { useEffect, useState } from "react";
import axios from "axios";
axios.defaults.timeout = 15000;

export default function useAxios(url: string | null) {
  const [dataCache, setDataCache] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (url !== null && dataCache[url] === undefined) {
      setIsLoading(true);
      async function fetchData() {
        let data: any;
        try {
          const { data: resData } = await axios.get(url!);
          data = resData;
        } catch (error) {
          data = { error };
        }
        setDataCache((dataCache) => ({ ...dataCache, [`${url}`]: data }));
        setIsLoading(false);
      }
      fetchData();
    }
  }, [url]);
  return { data: url !== null ? dataCache[url] : {}, isLoading };
}
