import { useState } from "react";
import type { Case, CaseForm } from "../types";
import { api } from "../api/cases";

export function useInlineEdit(onSaved: () => void) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<keyof CaseForm | null>(null);
  const [tempValue, setTempValue] = useState<string | number | null>(null);

  const startEdit = (
    caseId: number,
    field: keyof CaseForm,
    currentValue: string | number | null,
  ) => {
    setEditingId(caseId);
    setEditingField(field);
    setTempValue(currentValue);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
    setTempValue(null);
  };

  const commitEdit = async (c: Case) => {
    if (editingId === null || editingField === null) return;
    await api.cases.update(editingId, {
      title: c.title,
      client_id: c.client_id,
      assignee_id: c.assignee_id,
      status_id: c.status_id,
      order_amount: c.order_amount,
      progress_phase_id: c.progress_phase_id,
      due_date: c.due_date,
      description: c.description,
      [editingField]: tempValue,
    });
    cancelEdit();
    onSaved();
  };

  const isEditing = (caseId: number, field: keyof CaseForm) =>
    editingId === caseId && editingField === field;

  return {
    tempValue,
    setTempValue,
    startEdit,
    cancelEdit,
    commitEdit,
    isEditing,
  };
}
