<?php
// 1. ЗАЩИТА ЗАГОЛОВКОВ
// Лучше указать конкретный домен вашей игры вместо '*', если она уже опубликована.
// Например: header("Access-Control-Allow-Origin: https://yourgame.com");
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Accept");
header("Content-Type: application/json; charset=UTF-8");

// Разрешаем только POST запросы
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

// 2. ЗАЩИТА ОТ DoS (Ограничение размера полезной нагрузки)
// Баг-репорт не может весить больше 5 КБ. Этого более чем достаточно.
$input = file_get_contents('php://input');
if (strlen($input) > 5120) {
    http_response_code(413);
    echo json_encode(['success' => false, 'message' => 'Превышен лимит размера данных']);
    exit;
}

// 3. БЕЗОПАСНЫЙ PARSE JSON (PHP 7.3+)
try {
    $data = json_decode($input, true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Некорректный JSON формат']);
    exit;
}

// 4. ВАЛИДАЦИЯ И САНИТИЗАЦИЯ ДАННЫХ (Защита от Stored XSS)
if (!is_array($data) || empty(trim($data['description'] ?? ''))) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Отсутствует обязательное поле: описание']);
    exit;
}

// Очищаем все строковые данные от HTML-тегов и лишних пробелов
$safeData = [
    'id' => uniqid('bug_', true),
    'timestamp' => date('c'), // ISO 8601 формат
    'name' => htmlspecialchars(trim($data['name'] ?? 'Аноним'), ENT_QUOTES, 'UTF-8'),
    'email' => filter_var(trim($data['email'] ?? 'Не указан'), FILTER_SANITIZE_EMAIL) ?: 'Не указан',
    'description' => htmlspecialchars(trim($data['description']), ENT_QUOTES, 'UTF-8'),
    'steps' => htmlspecialchars(trim($data['steps'] ?? 'Не указаны'), ENT_QUOTES, 'UTF-8'),
    'gameState' => [
        'age' => (int)($data['gameState']['age'] ?? 0),
        'difficulty' => htmlspecialchars(trim($data['gameState']['difficulty'] ?? 'unknown'), ENT_QUOTES, 'UTF-8'),
        'version' => htmlspecialchars(trim($data['gameState']['version'] ?? 'unknown'), ENT_QUOTES, 'UTF-8')
    ]
];

// 5. БЕЗОПАСНАЯ РАБОТА С ФАЙЛАМИ (Защита от Race Condition)
$dir = __DIR__ . '/bug_reports';
$file = $dir . '/reports.json';

if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

// Открываем файл для чтения и записи, создаем если нет
$fp = fopen($file, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Ошибка доступа к файловой системе']);
    exit;
}

// Эксклюзивная блокировка файла (другой процесс будет ждать)
if (flock($fp, LOCK_EX)) {
    $reports = [];
    $content = stream_get_contents($fp);
    if ($content) {
        $reports = json_decode($content, true) ?: [];
    }

    // Добавляем новый отчет
    $reports[] = $safeData;

    // Фильтрация: оставляем только отчеты за последние 30 дней
    $thirtyDaysAgo = time() - (30 * 24 * 60 * 60);
    $reports = array_values(array_filter($reports, function($report) use ($thirtyDaysAgo) {
        return strtotime($report['timestamp']) > $thirtyDaysAgo;
    }));

    // Ограничиваем максимальное количество отчетов (доп. защита от переполнения диска)
    // Например, храним не более 1000 последних записей
    if (count($reports) > 1000) {
        $reports = array_slice($reports, -1000);
    }

    // Перемещаем указатель в начало и обрезаем файл перед записью
    ftruncate($fp, 0);
    rewind($fp);
    
    // Записываем с флагом JSON_UNESCAPED_UNICODE для читаемости кириллицы
    fwrite($fp, json_encode($reports, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Снимаем блокировку
    flock($fp, LOCK_UN);
} else {
    fclose($fp);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Не удалось заблокировать файл для записи']);
    exit;
}
fclose($fp);

// ========================================================================
// 6. ЗАГОТОВКА ДЛЯ ОТПРАВКИ НА ПОЧТУ (Безопасная)
// ========================================================================
/*
// ВНИМАНИЕ: Для продакшена настоятельно рекомендуется использовать PHPMailer 
// вместо функции mail(), так как mail() часто попадает в спам или блокируется хостером.

$to = "your_email@example.com";
$subject = "🐞 Баг-репорт: " . mb_substr($safeData['description'], 0, 50, 'UTF-8') . "...";

// Мы используем $safeData, который уже прошел через htmlspecialchars, 
// поэтому Header Injection и XSS в письме невозможны.
$message = "
<html>
<head><title>Новый баг-репорт</title></head>
<body>
    <h2>Детали отчета #{$safeData['id']}</h2>
    <p><strong>Имя:</strong> {$safeData['name']}</p>
    <p><strong>Email:</strong> {$safeData['email']}</p>
    <p><strong>Описание:</strong><br>" . nl2br($safeData['description']) . "</p>
    <p><strong>Шаги:</strong><br>" . nl2br($safeData['steps']) . "</p>
    <hr>
    <p><em>Версия: {$safeData['gameState']['version']} | Возраст: {$safeData['gameState']['age']} | Сложность: {$safeData['gameState']['difficulty']}</em></p>
</body>
</html>
";

$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-type:text/html;charset=UTF-8\r\n";
$headers .= "From: Game Bug Reporter <noreply@yourdomain.com>\r\n";

// mail($to, $subject, $message, $headers);
*/
// ========================================================================

http_response_code(200);
echo json_encode([
    'success' => true, 
    'message' => 'Отчет успешно сохранен',
    'total_reports' => count($reports)
]);
?>