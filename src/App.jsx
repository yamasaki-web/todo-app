import { useState, useEffect } from "react";

function App() {
  // 【状態管理】入力欄の文字を保持する箱
  const [text, setText] = useState("");

  // 【初期化】アプリ起動時に一度だけ、ブラウザの倉庫(localStorage)からデータを取り出す
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("my_todos");
    // 倉庫にデータがあれば(saved)、文字列を「配列」に戻して使う。なければ空の配列「[]」
    return saved ? JSON.parse(saved) : [];
  });

  // 今どのタブが選ばれているかを記憶する箱（初期値は "all"）
  const [filter, setFilter] = useState("all");

// 【自動保存】todosの中身が書き換わるたびに、最新の状態を倉庫に保存する
  useEffect(() => {
    localStorage.setItem("my_todos", JSON.stringify(todos));
  }, [todos]);

// 【追加機能】
  const addTodo = () => {
    if (text === "") return;// 空なら何もしない

    const today = new Date();

    // 日付を yyyy/mm/dd の形式に整える
    const dateString = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;

    // 1つのタスクを「オブジェクト」という塊で作る
    const newTodo = {
      id:crypto.randomUUID(), //IDを発行
      title: text,
      isCompleted: false,
      isImportant: false,
      date: dateString
    };

    // 元のtodosのコピーに、新しいタスクを1つ追加して、全体を差し替える
    setTodos([...todos, newTodo]);
    setText("");// 入力欄を空にする
  };

  // 【完了/未完了の切り替え】
  const toggleComplete = (id) => {
    // mapを使って「特定の1つだけ中身を書き換えた新しいリスト」を作る
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        // ...todo で今の中身をコピーしつつ、isCompletedだけを「反対（!）」にする
        return { ...todo, isCompleted: !todo.isCompleted };
      }
      return todo;// それ以外はそのまま
    });
    setTodos(newTodos);// 新しいリストで画面を更新
  };

  // 【重要マークの切り替え】
  const toggleImportant = (id) => {
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        // ...todo で「タイトル」「日付」「完了状態」はそのまま引き継ぎ、
        // isImportant だけを「今の反対（!）」に書き換える
        return { ...todo, isImportant: !todo.isImportant };
      }
      return todo;
    });
    setTodos(newTodos); // 新しいリストで画面を更新
  }


  // 【削除機能】
  const deleteTodo = (id) => {
    // filterを使って「選ばれた番号以外のデータ」だけで新しいリストを作る
    const newTodos = todos.filter((todo) => todo.id !== id);
    setTodos(newTodos);
  };

  // 【編集機能】
  const editTodo = (id) => {
    // いまクリックされたIDを持つタスクを todos の中から探し出す
    const targetTodo = todos.find((todo) => todo.id === id);
    if (!targetTodo) return;

    // 入力ダイアログを出して、新しい文字を受け取る
    const newTitle = window.prompt("タスクを編集してください", targetTodo.title);
    // キャンセルされたり、空っぽだったりした場合は何もしない
    if (newTitle === null || newTitle === "") return;

    // mapを使って「指定したIDだけ書き換えた新しい配列」を作る
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        // ...todo で今の日付や完了状態を引き継ぎつつ、titleだけを上書き
        return { ...todo, title: newTitle };
      }
      // 状態を更新（これで自動的に保存も走ります
      return todo;
    });
    setTodos(newTodos);
  };

  // 【全削除】
  const clearAll = () => {
    const ok = window.confirm("本当にすべてのタスクを削除してもよろしいですか？");
    if (ok) {
      setTodos([]);// 空の配列をセット
    }
  }

  // 入力中の文字を同期する
  const handleChange = (e) => {
    setText(e.target.value);
  };

    const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  }

  // 画面に表示するための「絞り込まれたリスト」を作る
  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") {
      return true; //"all"なら全部残す
    } else if (filter === "active") {
      return !todo.isCompleted;// "active"なら未完了(false)だけ残す
    } else if (filter === "completed") {
      return todo.isCompleted;// "completed"なら完了済み(true)だけ残す
    } else if (filter === "important") {
      return todo.isImportant;//「重要(true)」だけ残す
    }
    return true;
  });

  return (
    <div style={{ padding: "30px", backgroundColor: "#fff" }}>
      <h2 style={{ color: "#333" }}>マイTodoリスト</h2>
      <div>
        <input type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="タスクを入力してください。"
        />
        <button onClick={addTodo}>追加する</button>
      </div>

      <p style={{marginTop: "24px", color: "#333"}}>入力中の文字：{text}</p>
      <p>完了済み:{todos.filter(t => t.isCompleted).length} 件 / 全体:{todos.length} 件</p>

      <div style={{ marginTop: "24px", marginBottom: "24px", display: "flex", gap: "8px", justifyContent:"center"}}>
        <button onClick={()=>setFilter("all")} style={{fontWeight:filter==="all"?"bold":"normal"}}>すべて</button>
        <button onClick={()=>setFilter("active")} style={{fontWeight:filter==="active"?"bold":"normal"}}>未完了</button>
        <button onClick={() => setFilter("completed")} style={{fontWeight:filter==="completed"?"bold":"normal"}}>完了済み</button>
        <button onClick={() => setFilter("important")} style={{fontWeight:filter==="important"?"bold":"normal"}}>★重要のみ</button>
      </div>

      <ul>
        {/* 【重要変更】「todos」ではなく、新たに作った「filteredTodos」を使ってループする*/}
        {filteredTodos.map((todo) => (
          <li key={todo.id}
            style={{
              textDecoration: todo.isCompleted ? "line-through" : "none",
              color: todo.isCompleted ? "#ccc" : "#000",
              backgroundColor: todo.isImportant ? "#fffacd" : "transparent",
              listStyle:"none",
              padding:"4px",
              borderRadius:"5px"
            }}
          >
            <span onClick={() => toggleComplete(todo.id)} style={{ cursor: "pointer" }}>
              {todo.isImportant ? "★" :""}
              {todo.title}
            </span>

            <small style={{ marginLeft: "15px", color: "#888" }}>
              ({todo.date})
            </small>

            <button onClick={() => toggleImportant(todo.id)} style={{ marginLeft: "15px", cursor:"pointer" }}>
            {todo.isImportant ? "重要解除" : "重要"}
            </button>
            <button onClick={() => deleteTodo(todo.id)} style={{ marginLeft: "10px" }}>削除</button>
            <button onClick={() => editTodo(todo.id)} style={{ marginLeft: "10px", backgroundColor: "#4caf50", color: "white" , border: "none",borderRadius: "3px", cursor: "pointer"}}>編集</button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && (
        <button
          onClick={clearAll}
          style={{ marginTop: "20px", backgroundColor: "#ff4d4d", color: "white" }}>
          すべてのタスクを削除
        </button>
      )}
    </div>
  );
}

export default App;
