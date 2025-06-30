<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
.post-card {
      width: 370px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      overflow: hidden;
      margin: auto;
      position: relative;
    }

    /* GOOD DEEDS HEADER */
    .tag-header {
      background-color: #0077cc;
      color: white;
      padding: 8px 20px;
      font-weight: bold;
      font-size: 14px;
      border-top-left-radius: 15px;
      border-top-right-radius: 15px;
    }

    /* RESPONSE BY SECTION */
    .response-bar {
      padding: 12px 20px 12px 20px;
      background-color: white;
      position: relative;
      border-bottom: 1px solid #eee;
    }

    .response-bar h3 {
      font-size: 15px;
      font-weight: 500;
      margin: 0;
      color: #444;
    }

    .responder-avatars {
      position: absolute;
      top: 10px;
      right: 40px;
      display: flex;
      align-items: center;
      float: left;
    }

    .responder-avatars img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid white;
      object-fit: cover;
      margin-left: -10px;
      box-shadow: 0 0 2px rgba(0,0,0,0.3);
    }

    .add-btn {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: #0077cc;
      color: white;
      font-size: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: -10px;
      cursor: pointer;
    }

    /* RESOLUTION STATUS */
    .status {
      background-color: #888;
      color: white;
      padding: 10px 20px;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
    }

    /* CONTENT SECTION */
    .content {
      padding: 20px;
    }

    .author {
      font-weight: bold;
      font-size: 15px;
    }

    .timestamp {
      font-size: 12px;
      color: gray;
      margin-bottom: 10px;
    }

    .quote {
      font-style: italic;
      margin: 15px 0;
      font-size: 14px;
    }

    .image-container img {
      width: 100%;
      border-radius: 10px;
      object-fit: cover;
    }

    .button-container {
      text-align: center;
      padding: 20px;
    }

    .view-post-btn {
      background-color: #00b374;
      color: white;
      border: none;
      padding: 10px 25px;
      font-size: 14px;
      border-radius: 20px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .view-post-btn:hover {
      background-color: #009a60;
    }

    /* CLOSE BUTTON */
    .close-btn {
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 20px;
      color: #999;
      cursor: pointer;
    }
  </style>
</head>
<body>
   <div class="response-bar">
      <h3>Leader Board:</h3>
      <div class="responder-avatars">
        <img src="https://i.ibb.co/39Z55ry2/JmJ.png" alt="Responder 1">
        <img src="https://i.ibb.co/1Yj76MQW/whatsnext.png" alt="Responder 2">
        <div class="add-btn">+</div>
      </div>
    </div> <div class="status">Status: Pending | by Jozi My Jozi + 3 others</div>
<script>
 const allowedOrigins = [
  "https://1pulse-online-beta.netlify.app/",
  "https://1pulse.online/"
];

window.addEventListener('message', (event) => {
  if (!allowedOrigins.includes(event.origin)) return;

  const data = event.data;
  console.log("Safe message received:", data);
});

</script>

</body>
</html>
