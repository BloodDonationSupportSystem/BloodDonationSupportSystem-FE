interface PaginationProps {
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({ pageNumber, totalPages, hasPreviousPage, hasNextPage, onPageChange }: PaginationProps) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '24px 0', justifyContent: 'center' }}>
      <button
        className="btn"
        onClick={() => onPageChange(pageNumber - 1)}
        disabled={!hasPreviousPage}
        style={{ opacity: hasPreviousPage ? 1 : 0.5, cursor: hasPreviousPage ? 'pointer' : 'not-allowed' }}
      >
        Previous
      </button>
      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Page {pageNumber} of {totalPages}</span>
      <button
        className="btn"
        onClick={() => onPageChange(pageNumber + 1)}
        disabled={!hasNextPage}
        style={{ opacity: hasNextPage ? 1 : 0.5, cursor: hasNextPage ? 'pointer' : 'not-allowed' }}
      >
        Next
      </button>
    </div>
  );
} 