import { useState } from "react";

function AuthTest() {
  const [message, setMessage] = useState("");

  const registerUser = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: "Arshan",
            lastName: "Barkat",
            email: "arshan@test.com",
            password: "123456",
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  const loginUser = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "arshan@test.com",
            password: "123456",
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Authentication Test</h1>

      <button onClick={registerUser}>
        Register User
      </button>

      <button
        onClick={loginUser}
        style={{ marginLeft: "10px" }}
      >
        Login User
      </button>

      <p>{message}</p>
    </div>
  );
}

export default AuthTest;