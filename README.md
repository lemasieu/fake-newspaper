# 🗞️ Fake Newspaper Generator (Tạo Báo Lá Cải)

A dark‑themed, mobile‑friendly web tool that lets you create satirical, fictional newspaper clippings and download them as images — entirely in your browser.

> **⚠️ For satire and parody only.** This tool is intended for humorous, fictional content. Do not use it to impersonate real newspapers or spread misinformation.

## 🚀 Live Demo

Check out the live demo: [https://www.sieu.io.vn/j4f/fake-newspaper](https://www.sieu.io.vn/j4f/fake-newspaper)

## ✨ Features

- **Custom Newspaper Name** – Give your fictional paper any name you like
- **Smart Name Protection** – Built‑in keyword blocker prevents the use of real newspaper names (e.g., *Nhân Dân*, *Tuổi Trẻ*, *VnExpress*, *CNN*, *BBC*) and Vietnamese government agency names, with **real‑time warnings** as you type
- **Homoglyph‑Resistant Filter** – Uses NFKC normalization, Cyrillic/Greek homoglyph mapping, and diacritic stripping to catch disguised attempts (e.g., `VnЕxpress` with a Cyrillic `Е`)
- **Editable Fields** – Set the date, headline, and full article body
- **Optional Image Upload** – Add a custom illustration (max 5 MB, processed locally — never uploaded to any server)
- **Live Preview** – See your newspaper rendered in real time before downloading
- **One‑Click Download** – Export the finished clipping as a high‑resolution PNG (2× scale) using `html2canvas`
- **Auto Disclaimer** – Every generated image includes a footer clarifying that the newspaper is fictional and has no legal standing
- **Dark Theme** – Modern, eye‑friendly interface
- **Fully Responsive** – Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Technologies Used

- **HTML5** – Structure of the application
- **CSS3** – Dark theme, responsive layout, and print‑style newspaper typography
- **JavaScript (Vanilla)** – Form handling, homoglyph normalization, keyword validation, and image export
- **html2canvas** – Client‑side rendering of the preview to a downloadable PNG
- **No frameworks, no JSON, no backend** – Fully static and client‑side

## 📁 Project Structure

```
fake-newspaper/
├── index.html    # Main HTML file with the form and preview area
├── style.css     # Dark theme, responsive layout, newspaper typography
├── script.js     # Form logic, name validation, image handling, PNG export
└── README.md     # Project documentation
```

## 🔧 Installation & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/lemasieu/fake-newspaper.git
   ```
2. **Navigate to the project folder**   
   ```bash
   cd fake-newspaper
   ```
3. **Open the application**
   - Simply open `index.html` in your web browser
   - Or use a local development server (e.g., Live Server in VS Code)

## 📝 How It Works

1. **Enter a newspaper name** – Type any fictional name. If it contains a protected keyword (e.g., a real newspaper or government agency), a warning appears below the field and the **Generate** button will refuse to proceed.
2. **Set the date** – Pick a date for your clipping.
3. **Write the headline** – Type your main headline (defaults to a dramatic placeholder).
4. **Add an image (optional)** – Upload an illustration (JPG, PNG, etc., max 5 MB). The image is read locally via `FileReader` and never leaves your browser.
5. **Write the article body** – Type the full article text. Each line break becomes a separate paragraph.
6. **Click "Tạo Báo" (Generate)** – The preview area renders your newspaper instantly.
7. **Click "Tải Ảnh Về" (Download)** – Exports the preview as a 2×‑scale PNG named `bao-la-cai.png`.

### 🔒 Name Validation System

The keyword blocker is designed to prevent impersonation of real media and government entities. It works in three stages:

1. **NFKC normalization** – Converts fancy Unicode characters (full‑width letters, ligatures, etc.) to their basic ASCII equivalents.
2. **Homoglyph mapping** – Replaces Cyrillic and Greek characters that visually resemble Latin letters (e.g., Cyrillic `Е` → `e`, Greek `Α` → `a`).
3. **Diacritic stripping + cleanup** – Removes Vietnamese tone marks, converts `đ`/`Đ` to `d`, lowercases everything, and strips all non‑alphanumeric characters.

If the normalized name contains any keyword from the restricted list (real newspapers, news agencies, government bodies, provincial papers, and international outlets), the name is rejected with a specific warning message.

## 🤝 Contributing

Contributions are welcome! Feel free to submit a Pull Request or open an Issue.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is open-source and available under the MIT License.
