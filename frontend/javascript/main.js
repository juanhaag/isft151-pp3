const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const API_URL = "http://localhost:3000/api/auth";

// --- SIGNUP ---
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    username: document.getElementById("signupUsername").value,
    email: document.getElementById("signupEmail").value,
    phone: document.getElementById("signupPhone").value,
    password: document.getElementById("signupPassword").value,
  };

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Usuario creado: " + JSON.stringify(data));
    } else {
      alert("Error: " + (data.message || "No se pudo registrar"));
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
});

// --- LOGIN ---
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value,
  };

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      alert("Login exitoso: " + JSON.stringify(data));
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
    } else {
      alert("Error: " + (data.message || "Credenciales inválidas"));
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
});
