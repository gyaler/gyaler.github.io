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

## PDF 생성

제출용 PDF는 웹 페이지(`index.html`, `projects.html`)와 별도로 만든 전용 템플릿을 사용합니다.

- 메인 CV 템플릿: `cv_print.html`
- 프로젝트 템플릿: `projects_print.html`

생성 명령:

```powershell
cd c:\work\portfolio
powershell -ExecutionPolicy Bypass -File .\generate_pdfs.ps1
```

출력 파일:

- `KangJinmo_CV_Main.pdf`
- `KangJinmo_CV_Projects.pdf`
