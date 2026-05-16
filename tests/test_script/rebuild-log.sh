#!/bin/sh

set -e

VAULT_PATH=""
LOG_FILE=""
DELAY=5
VERBOSE=false

print_help() {
    printf "Использование: %s -v ПУТЬ_К_ХРАНИЛИЩУ -l ПУТЬ_К_ЛОГ_ФАЙЛУ [ОПЦИИ]\n\n" "$(basename "$0")"
    echo "Обязательные параметры:"
    echo "  -v, --vault-path ПУТЬ   Путь к хранилищу Obsidian"
    echo "  -l, --log-file ПУТЬ     Путь к лог-файлу"
    echo ""
    echo "Опции:"
    echo "  -d, --delay СЕКУНДЫ     Задержка после сборки в секундах (по умолчанию: 5)"
    echo "  -V, --verbose           Подробный вывод"
    echo "  -h, --help              Показать эту справку"
}

log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

verbose_log() {
    if [ "$VERBOSE" = true ]; then
        echo "🔍 [VERBOSE] $1"
    fi
}

while [ $# -gt 0 ]; do
    case "$1" in
        -v|--vault-path)
            VAULT_PATH="$2"
            shift 2
            ;;
        -l|--log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        -d|--delay)
            DELAY="$2"
            shift 2
            ;;
        -V|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            print_help
            exit 0
            ;;
        -*)
            echo "❌ Неизвестный параметр: $1"
            echo "Используйте $0 --help для справки"
            exit 1
            ;;
        *)
            echo "❌ Неизвестный аргумент: $1"
            echo "Используйте $0 --help для справки"
            exit 1
            ;;
    esac
done

if [ -z "$VAULT_PATH" ]; then
    echo "❌ Не указан путь к хранилищу (-v / --vault-path)"
    echo "Используйте $0 --help для справки"
    exit 1
fi

if [ -z "$LOG_FILE" ]; then
    echo "❌ Не указан путь к лог-файлу (-l / --log-file)"
    echo "Используйте $0 --help для справки"
    exit 1
fi

log_message "🔧 Запуск пересборки плагина Image Renderer..."
verbose_log "Vault path: $VAULT_PATH"
verbose_log "Log file: $LOG_FILE"
verbose_log "Delay: $DELAY сек"

if [ ! -d "$VAULT_PATH" ]; then
    echo "❌ Хранилище не найдено: $VAULT_PATH"
    exit 1
fi

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Лог-файл не найден: $LOG_FILE"
    exit 1
fi

PROJECT_ROOT="$(pwd)"
if [ ! -d "$PROJECT_ROOT" ]; then
    echo "❌ Директория проекта не найдена: $PROJECT_ROOT"
    exit 1
fi

echo ""
log_message "🔄 Шаг 1: Пересборка (npm run build)..."
npm run build
echo "✅ Сборка завершена"

echo ""
log_message "⏳ Шаг 2: Ожидание обновления Obsidian (${DELAY} сек)..."
sleep "$DELAY"
echo "✅ Пауза завершена"

echo ""
log_message "📄 Шаг 3: Логи (последние 200 строк)..."
echo "--- НАЧАЛО ЛОГА ---"
tail -n 200 "$LOG_FILE"
echo "--- КОНЕЦ ЛОГА ---"

echo ""
log_message "📋 Готово."
date '+%Y-%m-%d %H:%M:%S' > .last_rebuild_timestamp
exit 0
