import React, { useState } from "react";
import { TodoType } from "../types";
import useSWR from "swr";
import { useTodos } from "../hooks/useTodos";
import { API_URL } from "@/constants/url";

type TodoProps = {
  todo: TodoType;
};

////////// useTodos.tsにリファクタリング //////////////
// useSWR("API", fetcher)のコールバック関数fetcherの定義
// async function fetcher(key: string) {
//   return fetch(key).then((res) => res.json());
// }
////////// useTodos.tsにリファクタリング //////////////

const Todo = ({ todo }: TodoProps) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(todo.title);
  //初期値がタイトル.<input>タグのonChange={(e) => setEditedTitle(e.target.value)}で
  // 同<input>タグのvalueを取得可能に（value={editedTitle}）

  const { todos, isLoading, error, mutate } = useTodos(); //カスタムフックuseTodos.tsから受け取り.

  ////////// useTodos.tsにリファクタリング //////////////
  // useSWR = SSRに似てるが自動的に良いタイミングでブラウザにキャッシュもしてくれる.
  // const { data, isLoading, error, mutate } = useSWR(
  //   "http://localhost:8080/allTodos",
  //   fetcher
  // );
  ////////// useTodos.tsにリファクタリング //////////////

  //<button>タグでonClick={handleEdit}でisEditingステート変数のフラグを切り替え.
  const handleEdit = async () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      const response = await fetch(`${API_URL}/editTodo/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editedTitle }),
      });

      if (response.ok) {
        const editedTodo = await response.json();
        const updatedTodos = todos.map(
          (todo: TodoType) => (todo.id === editedTodo.id ? editedTodo : todo) //編集対象タスクだけを取り出してeditedTodoに入れてる.
        );
        //mutate([...todos, editedTodo]); //この書き方だと既存のすべてのtodosにeditedTodoを追加する、と言う意味になり重複してしまう.
        mutate(updatedTodos); // mutate、新しくTodoが追加されると画面をリロードしなくてもリストに反映される.
      }
    }
  };

  //onClick={() => handleDelete(todo.id)}で(id:number)を持って来る
  const handleDelete = async (id: number) => {
    const response = await fetch(`${API_URL}/deleteTodo/${todo.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const deletedTodo = await response.json();
      // 該当todo.idのタスクをfilterで除いたすべてのタスクがupdatedTodos
      const updatedTodos = todos.filter((todo: TodoType) => todo.id !== id);
      //mutate([...todos, updatedTodos]); //この書き方だと既存のすべてのtodosにeditedTodoを追加する、と言う意味になり重複してしまう.
      mutate(updatedTodos); // mutate、新しくTodoが追加されると画面をリロードしなくてもリストに反映される.
    }
  };

  // チェックボックスの<input>タグのonChange={() => toggleTodoCompletion(todo.id, todo.isCompleted)}
  // によりチェックつけると発火. isCompletedはtype.tsのTodoType型定義を参照.
  const toggleTodoCompletion = async (id: number, isCompleted: boolean) => {
    const response = await fetch(`${API_URL}/editTodo/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: !isCompleted }),
    });

    if (response.ok) {
      const editedTodo = await response.json();
      const updatedTodos = todos.map(
        (todo: TodoType) => (todo.id === editedTodo.id ? editedTodo : todo) //編集対象タスクだけを取り出してeditedTodoに入れてる.
      );
      //mutate([...todos, editedTodo]); //この書き方だと既存のすべてのtodosにeditedTodoを追加する、と言う意味になり重複してしまう.
      mutate(updatedTodos); // mutate、新しくTodoが追加されると画面をリロードしなくてもリストに反映される.
    }
  };

  return (
    <div>
      <li className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="todo1"
              name="todo1"
              type="checkbox"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500
                  border-gray-300 rounded"
              onChange={() => toggleTodoCompletion(todo.id, todo.isCompleted)}
            />
            <label className="ml-3 block text-gray-900">
              {isEditing ? (
                <input
                  type="text"
                  className="border rounded py-1 px-2"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              ) : (
                <span
                  className={`text-lg font-medium mr-2 ${
                    todo.isCompleted ? "line-through" : ""
                  }`}
                >
                  {todo.title}{" "}
                </span>
              )}
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEdit}
              className="duration-150 bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded"
            >
              {isEditing ? "Save" : "✒"}
            </button>
            <button
              onClick={() => handleDelete(todo.id)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded"
            >
              ✖
            </button>
          </div>
        </div>
      </li>
    </div>
  );
};

export default Todo;
