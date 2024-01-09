import { API_URL } from "@/constants/url";
import useSWR from "swr";

// useSWR("API", fetcher)のコールバック関数fetcherの定義
async function fetcher(key: string) {
  return fetch(key).then((res) => res.json());
}

export const useTodos = () => {
  // useSWR = SSRに似てるが自動的に良いタイミングでブラウザにキャッシュもしてくれる.
  const { data, isLoading, error, mutate } = useSWR(
    `${API_URL}/allTodos`,
    fetcher
  );

  return {
    todos: data,
    isLoading,
    error,
    mutate,
  }
}