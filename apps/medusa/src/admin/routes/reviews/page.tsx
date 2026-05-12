import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ChatBubbleLeftRight } from "@medusajs/icons";
import {
  createDataTableColumnHelper,
  createDataTableCommandHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  StatusBadge,
  Toaster,
  toast,
  DataTablePaginationState,
  DataTableRowSelectionState,
  Drawer,
  Button,
  Textarea,
  Label,
} from "@medusajs/ui";
import { HttpTypes } from "@medusajs/framework/types";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { sdk } from "../../lib/sdk";

type Review = {
  id: string;
  title?: string;
  content: string;
  rating: number;
  product_id: string;
  customer_id?: string;
  status: "pending" | "approved" | "flagged";
  verified_purchase: boolean;
  created_at: Date;
  updated_at: Date;
  product?: HttpTypes.AdminProduct;
  response?: {
    id: string;
    content: string;
    created_at: string;
  } | null;
};

const columnHelper = createDataTableColumnHelper<Review>();

const commandHelper = createDataTableCommandHelper();
type Translate = ReturnType<typeof useTranslation>["t"];

const useCommands = (refetch: () => void, t: Translate) => {
  const statusCommands = [
    { label: t("reviews.commands.approve"), shortcut: "A", status: "approved" },
    { label: t("reviews.commands.flag"), shortcut: "F", status: "flagged" },
  ] as const;

  return statusCommands.map(({ label, shortcut, status }) =>
    commandHelper.command({
      label,
      shortcut,
      action: async (selection) => {
        const ids = Object.keys(selection);
        try {
          await sdk.client.fetch("/admin/reviews/status", {
            method: "POST",
            body: { ids, status },
          });
          toast.success(t(`reviews.toasts.status.${status}`));
          refetch();
        } catch {
          toast.error(t("reviews.toasts.statusFailed"));
        }
      },
    }),
  );
};

const limit = 15;

const statusColor = (status: Review["status"]): "green" | "red" | "grey" => {
  switch (status) {
    case "approved":
      return "green";
    case "flagged":
      return "red";
    default:
      return "grey";
  }
};

const ReviewDetailDrawer = ({
  review,
  open,
  onClose,
  onResponseChange,
  t,
}: {
  review: Review | null;
  open: boolean;
  onClose: () => void;
  onResponseChange: () => void;
  t: Translate;
}) => {
  const [responseContent, setResponseContent] = useState(
    review?.response?.content || "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!review) return;
    setIsSaving(true);
    try {
      await sdk.client.fetch(`/admin/reviews/${review.id}/response`, {
        method: "POST",
        body: { content: responseContent },
      });
      toast.success(t("reviews.toasts.responseSaved"));
      onResponseChange();
      onClose();
    } catch {
      toast.error(t("reviews.toasts.responseSaveFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!review) return;
    setIsSaving(true);
    try {
      await sdk.client.fetch(`/admin/reviews/${review.id}/response`, {
        method: "DELETE",
      });
      toast.success(t("reviews.toasts.responseDeleted"));
      onResponseChange();
      onClose();
    } catch {
      toast.error(t("reviews.toasts.responseDeleteFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("reviews.detail.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="space-y-4">
          {review && (
            <>
              <div>
                <Label>{t("reviews.detail.rating")}</Label>
                <p className="txt-compact-small">{review.rating}/5</p>
              </div>
              {review.title && (
                <div>
                  <Label>{t("reviews.detail.titleLabel")}</Label>
                  <p className="txt-compact-small">{review.title}</p>
                </div>
              )}
              <div>
                <Label>{t("reviews.detail.content")}</Label>
                <p className="txt-compact-small">{review.content}</p>
              </div>
              <div>
                <Label>{t("reviews.detail.purchase")}</Label>
                <p className="txt-compact-small">
                  {review.verified_purchase
                    ? t("reviews.detail.verifiedPurchase")
                    : t("reviews.detail.notLinkedToPurchase")}
                </p>
              </div>
              <div className="border-t pt-4">
                <Label htmlFor="admin-response">
                  {t("reviews.detail.adminResponse")}
                </Label>
                <Textarea
                  id="admin-response"
                  value={responseContent}
                  onChange={(e) => setResponseContent(e.target.value)}
                  rows={4}
                  className="mt-2"
                  placeholder={t("reviews.detail.responsePlaceholder")}
                />
              </div>
            </>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary" size="small">
              {t("reviews.actions.cancel")}
            </Button>
          </Drawer.Close>
          {review?.response && (
            <Button
              variant="danger"
              size="small"
              onClick={handleDelete}
              isLoading={isSaving}
            >
              {t("reviews.actions.delete")}
            </Button>
          )}
          <Button
            variant="primary"
            size="small"
            onClick={handleSave}
            disabled={isSaving || !responseContent.trim()}
            isLoading={isSaving}
          >
            {review?.response
              ? t("reviews.actions.updateResponse")
              : t("reviews.actions.saveResponse")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

const ReviewsPage = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  });

  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {},
  );
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const columns = useMemo(
    () => [
      columnHelper.select(),
      columnHelper.accessor("id", {
        header: t("reviews.table.id"),
      }),
      columnHelper.accessor("title", {
        header: t("reviews.table.title"),
      }),
      columnHelper.accessor("rating", {
        header: t("reviews.table.rating"),
      }),
      columnHelper.accessor("content", {
        header: t("reviews.table.content"),
      }),
      columnHelper.accessor("status", {
        header: t("reviews.table.status"),
        cell: ({ row }) => (
          <StatusBadge color={statusColor(row.original.status)}>
            {t(`reviews.status.${row.original.status}`)}
          </StatusBadge>
        ),
      }),
      columnHelper.accessor("response", {
        header: t("reviews.table.response"),
        cell: ({ row }) => {
          return row.original.response ? (
            <StatusBadge color="green">
              {t("reviews.table.responded")}
            </StatusBadge>
          ) : (
            <StatusBadge color="grey">
              {t("reviews.table.noResponse")}
            </StatusBadge>
          );
        },
      }),
      columnHelper.accessor("verified_purchase", {
        header: t("reviews.table.verified"),
        cell: ({ row }) =>
          row.original.verified_purchase ? (
            <StatusBadge color="green">
              {t("reviews.table.verifiedPurchase")}
            </StatusBadge>
          ) : (
            <StatusBadge color="grey">
              {t("reviews.table.unverified")}
            </StatusBadge>
          ),
      }),
      columnHelper.accessor("product", {
        header: t("reviews.table.product"),
        cell: ({ row }) => {
          return (
            <Link to={`/products/${row.original.product_id}`}>
              {row.original.product?.title}
            </Link>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
          <button
            onClick={() => setSelectedReview(row.original)}
            className="text-sm text-blue-600 hover:underline"
          >
            {t("reviews.actions.view")}
          </button>
        ),
      }),
    ],
    [t],
  );

  const offset = pagination.pageIndex * limit;

  const { data, isLoading, refetch } = useQuery<{
    reviews: Review[];
    count: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ["reviews", offset, limit],
    queryFn: () =>
      sdk.client.fetch("/admin/reviews", {
        query: {
          offset,
          limit,
          order: "-created_at",
        },
      }),
  });

  const commands = useCommands(refetch, t);

  const table = useDataTable({
    columns,
    data: data?.reviews || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    commands,
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
    getRowId: (row) => row.id,
  });

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>{t("reviews.pageTitle")}</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
        <DataTable.CommandBar
          selectedLabel={(count) => t("reviews.selectedLabel", { count })}
        />
      </DataTable>
      <Toaster />
      <ReviewDetailDrawer
        key={selectedReview?.id}
        review={selectedReview}
        open={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        onResponseChange={refetch}
        t={t}
      />
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "reviews.pageTitle",
  translationNs: "translation",
  icon: ChatBubbleLeftRight,
});

export default ReviewsPage;
