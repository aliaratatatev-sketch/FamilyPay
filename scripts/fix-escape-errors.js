/**
 * Скрипт для автоматического исправления escape-ошибок в TSX файлах
 * Исправляет: \n, `n и другие неправильные escape-последовательности
 */

const fs = require('fs');
const path = require('path');

// Паттерны для поиска и замены
const patterns = [
  // Паттерн 1: return (\n ... => return (
  {
    search: /return\s*\(\\n/g,
    replace: 'return (',
    description: 'return (\\n -> return ('
  },
  // Паттерн 2: )`n => )
  {
    search: /\)`n/g,
    replace: ')',
    description: ')`n -> )'
  },
  // Паттерн 3: </>`n => </>
  {
    search: /<\/>`n/g,
    replace: '</>',
    description: '</>`n -> </>'
  },
  // Паттерн 4: \n внутри JSX (но не в строках)
  {
    search: /([>}])\s*\\n\s*([<{])/g,
    replace: '$1\n$2',
    description: 'JSX \\n -> реальный перенос'
  }
];

// Рекурсивный поиск всех .tsx файлов
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Пропускаем node_modules и .next
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        findTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Проверка и исправление файла
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let fixes = [];
  
  patterns.forEach(pattern => {
    if (pattern.search.test(content)) {
      content = content.replace(pattern.search, pattern.replace);
      modified = true;
      fixes.push(pattern.description);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Исправлен: ${path.relative(process.cwd(), filePath)}`);
    fixes.forEach(fix => console.log(`   - ${fix}`));
    return 1;
  }
  
  return 0;
}

// Главная функция
function main() {
  console.log('🔍 Поиск .tsx/.ts файлов с escape-ошибками...\n');
  
  const projectRoot = path.join(__dirname, '..');
  const tsxFiles = findTsxFiles(projectRoot);
  
  console.log(`📁 Найдено ${tsxFiles.length} файлов\n`);
  
  let fixedCount = 0;
  
  tsxFiles.forEach(file => {
    fixedCount += fixFile(file);
  });
  
  console.log(`\n🎉 Готово! Исправлено файлов: ${fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n💡 Рекомендация: Перезапустите dev сервер для применения изменений');
    console.log('   npm run dev');
  } else {
    console.log('\n✨ Все файлы в порядке!');
  }
}

// Запуск
main();
