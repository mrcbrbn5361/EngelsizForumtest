const fs = require('fs');
let code = fs.readFileSync('app/discussions/new/page.tsx', 'utf8');
code = code.replace(
  "if (!content.trim()) {\n      toast.error('Lütfen tartışma içeriğini yazın.');\n      return;\n    }",
  `if (!content.trim()) {
      toast.error('Lütfen tartışma içeriğini yazın.');
      return;
    }

    const forbiddenWords = ['spam', 'reklam', 'kumar', 'bet', 'casino'];
    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const isSpam = forbiddenWords.some(word => lowerContent.includes(word) || lowerTitle.includes(word));
    if (isSpam) {
      toast.error('İçeriğiniz otomatik spam filtresine takıldı. Lütfen kurallara uygun içerik girin.');
      return;
    }`
);
fs.writeFileSync('app/discussions/new/page.tsx', code);
