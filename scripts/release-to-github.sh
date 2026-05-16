#!/bin/sh
set -e

# ------------------------------------------------------------
# СТРОГАЯ ВЕРСИЯ: если релиз для тега уже существует — падаем.
# Переменные окружения:
#   VERSION         – тег релиза (например, v1.2.3 или 1.2.3)
#   GITHUB_TOKEN    – персональный токен GitHub с правами на запись
#   GITHUB_OWNER    – владелец репозитория (Evgene-Kopylov)
#   GITHUB_REPO     – имя репозитория (fsrs_plugin)
# ------------------------------------------------------------

if [ -z "$VERSION" ]; then
    echo "❌ ОШИБКА: переменная окружения VERSION не задана."
    exit 1
fi

# Нормализуем тег: убираем префикс 'v' для отображения имени, но в API используем исходный VERSION
TAG_NAME="$VERSION"
DISPLAY_VERSION="${VERSION#v}"

RELEASE_FILES="main.js manifest.json styles.css"

echo "📦 Подготовка релиза для тега: ${TAG_NAME} (версия ${DISPLAY_VERSION})"
echo "📎 Файлы для загрузки: ${RELEASE_FILES}"

# 1. Проверяем наличие и непустоту файлов
for file in $RELEASE_FILES; do
    if [ ! -f "$file" ]; then
        echo "❌ ОШИБКА: обязательный файл '$file' не найден."
        exit 1
    fi
    if [ ! -s "$file" ]; then
        echo "❌ ОШИБКА: файл '$file' пуст (размер 0)."
        exit 1
    fi
    echo "   ✅ Файл '$file' существует и не пуст."
done

# 2. СТРОГАЯ ПРОВЕРКА: релиз с таким тегом НЕ должен существовать
echo "🔍 Проверяем, существует ли релиз для тега ${TAG_NAME}..."
RESPONSE=$(curl -s -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/tags/${TAG_NAME}")

RELEASE_ID=$(echo "$RESPONSE" | jq -r '.id // empty')

if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "null" ]; then
    echo "❌ ОШИБКА: Релиз для тега '${TAG_NAME}' уже существует в репозитории ${GITHUB_OWNER}/${GITHUB_REPO}."
    echo "   Политика проекта запрещает повторную публикацию одного и того же тега."
    echo "   Для выпуска новой версии необходимо создать новый тег (например, с инкрементом версии)."
    exit 1
fi

echo "✅ Релиз для тега '${TAG_NAME}' ещё не существует. Продолжаем создание..."

# 3. Создаём новый релиз
echo "📤 Создаём новый релиз..."
CREATE_RESPONSE=$(curl -s -X POST \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases" \
    -d "{
        \"tag_name\": \"${TAG_NAME}\",
        \"name\": \"${DISPLAY_VERSION}\",
        \"body\": \"Автоматически созданный релиз версии ${DISPLAY_VERSION}\",
        \"draft\": false,
        \"prerelease\": false
    }")

RELEASE_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
UPLOAD_URL=$(echo "$CREATE_RESPONSE" | jq -r '.upload_url' | sed 's/{.*}//')

if [ -z "$RELEASE_ID" ] || [ "$RELEASE_ID" = "null" ]; then
    echo "❌ Не удалось создать релиз. Ответ API:"
    echo "$CREATE_RESPONSE" | jq .
    exit 1
fi

echo "✅ Релиз создан. ID: ${RELEASE_ID}"
echo "   URL для загрузки: ${UPLOAD_URL}"

# 4. Загружаем файлы
for file in $RELEASE_FILES; do
    echo "⬆️  Загружаем '$file'..."

    # Определяем Content-Type
    CONTENT_TYPE="application/octet-stream"
    case "$file" in
        *.js)   CONTENT_TYPE="application/javascript" ;;
        *.json) CONTENT_TYPE="application/json" ;;
        *.css)  CONTENT_TYPE="text/css" ;;
    esac

    UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: token ${GITHUB_TOKEN}" \
        -H "Content-Type: ${CONTENT_TYPE}" \
        -H "Accept: application/vnd.github.v3+json" \
        --data-binary @"$file" \
        "${UPLOAD_URL}?name=$file")

    HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)
    BODY=$(echo "$UPLOAD_RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "201" ]; then
        echo "   ✅ Файл '$file' успешно загружен."
    else
        echo "   ❌ Ошибка загрузки '$file'. HTTP-код: ${HTTP_CODE}"
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
        exit 1
    fi
done

echo "🎉 Релиз ${TAG_NAME} успешно опубликован и готов к использованию."
