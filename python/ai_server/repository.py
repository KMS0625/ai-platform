from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg
from psycopg import sql
from psycopg.rows import dict_row

from .schemas import PageResponse


class PageRepository:
    def __init__(self, database_url: str) -> None:
        # `schema` is a Prisma URL option, not a libpq connection option.
        parts = urlsplit(database_url)
        query = parse_qsl(parts.query, keep_blank_values=True)
        self._schema = next((value for key, value in query if key == "schema"), None)
        self._database_url = urlunsplit(parts._replace(
            query=urlencode([(key, value) for key, value in query if key != "schema"])
        ))

    def find_by_note_id(self, note_id: str) -> list[PageResponse]:
        with psycopg.connect(
            self._database_url, connect_timeout=5, row_factory=dict_row,
        ) as connection:
            if self._schema:
                connection.execute(sql.SQL("SET search_path TO {}").format(sql.Identifier(self._schema)))
            rows = connection.execute(
                '''SELECT "id", "noteId", "title", "content", "keywords",
                          "priority", "importance", "enabled", "order", "createdAt"
                   FROM "Page"
                   WHERE "noteId" = %s
                   ORDER BY "order" ASC, "createdAt" ASC, "id" ASC''',
                (note_id,),
            ).fetchall()
        return [PageResponse.model_validate(row) for row in rows]
