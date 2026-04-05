export function unwrapApiData(payload) {
  return payload?.data ?? payload ?? {};
}

export function cleanQueryParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      return value !== "" && value !== null && value !== undefined;
    }),
  );
}

export function normalizeUsersResponse(payload) {
  const data = unwrapApiData(payload);

  if (Array.isArray(data)) {
    return data;
  }

  const users = data?.users ?? data?.items ?? data?.rows ?? [];
  return Array.isArray(users) ? users : [];
}

export function normalizeRecordsResponse(payload) {
  const root = payload || {};
  const data = unwrapApiData(payload);
  const paginationSource = root?.pagination ?? data?.pagination ?? {};

  let recordsCandidate;

  if (Array.isArray(data)) {
    recordsCandidate = data;
  } else {
    recordsCandidate =
      data?.records ??
      data?.items ??
      data?.rows ??
      data?.data ??
      root?.records ??
      root?.items ??
      root?.rows ??
      root?.data ??
      [];
  }

  const records = Array.isArray(recordsCandidate) ? recordsCandidate : [];

  const pageValue = Number(
    paginationSource?.page ??
      data?.page ??
      data?.currentPage ??
      root?.page ??
      root?.currentPage ??
      1,
  );
  const limitValue = Number(
    paginationSource?.limit ??
      paginationSource?.perPage ??
      data?.limit ??
      data?.perPage ??
      root?.limit ??
      root?.perPage ??
      10,
  );
  const totalValue = Number(
    paginationSource?.total ??
      paginationSource?.totalRecords ??
      data?.total ??
      data?.totalRecords ??
      root?.total ??
      root?.totalRecords ??
      records.length,
  );

  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isFinite(limitValue) && limitValue > 0 ? limitValue : 10;
  const total =
    Number.isFinite(totalValue) && totalValue >= 0
      ? totalValue
      : records.length;

  const pageCountValue = Number(
    paginationSource?.totalPages ??
      paginationSource?.pages ??
      data?.totalPages ??
      data?.pages ??
      root?.totalPages ??
      root?.pages ??
      Math.ceil(total / limit),
  );
  const totalPages =
    Number.isFinite(pageCountValue) && pageCountValue > 0 ? pageCountValue : 1;

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}
