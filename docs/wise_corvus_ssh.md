# Wise Corvus — SSH и выгрузка прода

VPS из панели Timeweb «Система Учета» (Владислав Автоблеск):

| Параметр | Значение |
|----------|----------|
| Хост | `45.153.69.171` |
| Пользователь | `root` |
| Команда | `ssh root@45.153.69.171` |
| Пароль | вкладка **Доступ** → **Root-пароль** (показать / сбросить) |

## Ключ Cursor Agent (чтобы агент мог rsync)

Публичный ключ (добавить в Timeweb: сервер → **Доступ** → SSH-ключи):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILx3kQM586W2qzWHJuTJoO5SuxLsEKEPXculdCs8Qirz cursor-agent-wise-corvus
```

Файл в репо: `docs/wise_corvus.pub` (копия).

После добавления ключа с этой VM:

```bash
ssh -i ~/.ssh/wise_corvus root@45.153.69.171
```

## Скачать проект с сервера

```bash
/workspace/scripts/pull-wise-corvus-prod.sh
```

Или вручную (путь уточнить на сервере: `ls -la /var/www`):

```bash
rsync -avz -e "ssh -i ~/.ssh/wise_corvus" root@45.153.69.171:/var/www/ПУТЬ/ ./wise-corvus-prod/
```

## GitHub

После выгрузки логичные варианты:

- обновить приватный **[NikitaErmilovv/avtoblesk42](https://github.com/NikitaErmilovv/avtoblesk42)** (сайт АвтоБлеск), если на VPS лежит тот же стек;
- или новый репозиторий, например `sistema-ucheta-avtoblesk`, если это отдельное приложение учёта.

**Не путать** с `avtoblesk-novokuznetsk` в Melissa-tech.ru — это другая ветка разработки, не обязательно совпадает с Wise Corvus.
