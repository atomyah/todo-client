"use client";

import Image from "next/image";
import Todo from "./components/Todo";
import useSWR from "swr";
import { TodoType } from "./types";
import { useRef } from "react";
import { useTodos } from "./hooks/useTodos";
import { API_URL } from "@/constants/url";

////////// useTodos.tsにリファクタリング //////////////
// useSWR("API", fetcher)のコールバック関数fetcherの定義
// async function fetcher(key: string) {
//   return fetch(key).then((res) => res.json());
// }
////////// useTodos.tsにリファクタリング //////////////

export default function Home() {
  const { todos, isLoading, error, mutate } = useTodos(); //カスタムフックuseTodos.tsから受け取り.

  // <input>タグにref={inputRef}と指定（53行目）.これでinputRef.currentで
  // <input>タグの属性を取り出すことができる. inputRef.current.valueで入力内容
  // を取り出すことができる.（型指定必要↓<HTMLInputElement | null>）
  const inputRef = useRef<HTMLInputElement | null>(null);

  // const allTodos = await fetch("API", { cache: "no-store" }); //SSR本来の書き方
  // const [todos, setTodos] = useState([]); // useSWRを使えばこのようなuseStateも必要なくなる

  ////////// useTodos.tsにリファクタリング //////////////
  // useSWR = SSRに似てるが自動的に良いタイミングでブラウザにキャッシュもしてくれる.
  // const { data, isLoading, error, mutate } = useSWR(
  //   "http://localhost:8080/allTodos",
  //   fetcher //５～７行目で定義
  // );
  ////////// useTodos.tsにリファクタリング //////////////

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`${API_URL}/createTodo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: inputRef.current?.value,
        isCompleted: false,
      }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      mutate([...todos, newTodo]); // mutate、新しくTodoが追加されると画面をリロードしなくてもリストに反映される.
      inputRef.current!.value = ""; // <input>タグをカラにする.
    }

    // if (inputRef.current) {
    //   // console.log('inputRef.currentは、', inputRef.current.value);
    // }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-32 py-4 px-4">
      <div className="px-4 py-2">
        <h1 className="text-gray-800 font-bold text-2xl uppercase">
          To-Do List
        </h1>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-auto px-4 py-2"
      >
        <div className="flex items-center border-b-2 border-teal-500 py-2">
          <input
            className="appearance-none bg-transparent
      border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight
      focus:outline-none"
            type="text"
            placeholder="Add a task"
            ref={inputRef}
          />
          <button
            className="duration-150 flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
          >
            Add
          </button>
        </div>
      </form>
      <ul className="divide-y divide-gray-200 px-4">
        {todos?.map((todo: TodoType) => (
          <Todo key={todo.id} todo={todo} />
        ))}
      </ul>
    </div>
  );
}
