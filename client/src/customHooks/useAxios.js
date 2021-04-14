import { useEffect, useState } from "react";
import axios from "axios";

export const useAxios = (url) => {
  const [state, setState] = useState({ data: null, loading: true });

  useEffect(() => {
    setState((state) => ({ data: null, loading: true }));
    console.log(url);
    if (url) {
      axios
        .get(url)
        .then((res) => {
          setState({ data: res.data, loading: false });
        })
        .catch((err) => {
          setState({ data: { error: err.message }, loading: false });
        });
    }
  }, [url, setState]);
  console.log(state);
  return state;
};
