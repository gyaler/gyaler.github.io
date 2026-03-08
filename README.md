# Jinmo Kang Portfolio

정적 페이지 포트폴리오입니다. GitHub Pages 사용자 사이트(`gyaler.github.io`)용으로 작성했습니다.

## 로컬 확인

```powershell
cd c:\work\portfolio
python -m http.server 5500
```

브라우저에서 `http://localhost:5500` 접속

## 배포

```powershell
cd c:\work\portfolio
git add .
git commit -m "Add portfolio landing page"
git push -u origin master
```

GitHub Pages 사용자 사이트는 `master` 브랜치 루트의 `index.html`을 바로 서빙합니다.
