import fetch from "node-fetch";

async function testLogin() {
  const url = process.env.PROD_LOGIN_URL || "https://www.revenueparty.com/api/auth/login";
  const username = process.env.ADMIN_EMAIL || "admin@revenueparty.com";
  const password = process.env.ADMIN_PASSWORD || "test1234";

  console.log(`Attempting login against ${url} ...`);

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  console.log(`Status: ${response.status} ${response.statusText}`);
  const text = await response.text();
  try {
    console.log("Response JSON:", JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log("Response Text:", text);
  }
}

testLogin().catch((err) => {
  console.error("Login test failed:", err);
  process.exit(1);
});

