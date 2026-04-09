import { getPages } from "../lib/utils.js";

let pageCount;

const applyPagination = (query, state, action) => {
  const limit = state.rowsPerPage;
  let page = state.page;

  if (action)
    switch (action.name) {
      case "prev":
        page = Math.max(1, page - 1);
        break; // переход на предыдущую страницу
      case "next":
        page = Math.min(pageCount, page + 1);
        break; // переход на следующую страницу
      case "first":
        page = 1;
        break; // переход на первую страницу
      case "last":
        page = pageCount;
        break; // переход на последнюю страницу
    }

  return Object.assign({}, query, {
    limit,
    page,
  });
};

const updatePagination = (
  total,
  { page, limit },
  { pages, fromRow, toRow, totalRows },
  pageTemplate,
  createPage,
) => {
  pageCount = Math.ceil(total / limit);

  // @todo: #2.4 — получить список видимых страниц и вывести их
  const visiblePages = getPages(page, pageCount, 5); // Получим массив страниц, которые нужно показать, выводим только 5 страниц
  pages.replaceChildren(
    ...visiblePages.map((pageNumber) => {
      // перебираем их и создаём для них кнопку
      const el = pageTemplate.cloneNode(true); // клонируем шаблон, который запомнили ранее
      return createPage(el, pageNumber, pageNumber === page); // вызываем колбэк из настроек, чтобы заполнить кнопку данными
    }),
  );

  // @todo: #2.5 — обновить статус пагинации
  fromRow.textContent = (page - 1) * limit + 1; // С какой строки выводим
  toRow.textContent = Math.min(page * limit, total); // До какой строки выводим, если это последняя страница, то отображаем оставшееся количество
  totalRows.textContent = total; // Сколько всего строк выводим на всех страницах вместе (после фильтрации будет меньше)
};

export const initPagination = (
  { pages, fromRow, toRow, totalRows },
  createPage,
) => {
  const pageTemplate = pages.firstElementChild.cloneNode(true);
  pages.firstElementChild.remove();

  return {
    applyPagination: (query, state, action) =>
      applyPagination(query, state, action),
    updatePagination: (total, query) =>
      updatePagination(
        total,
        query,
        { pages, fromRow, toRow, totalRows },
        pageTemplate,
        createPage,
      ),
  };
};
