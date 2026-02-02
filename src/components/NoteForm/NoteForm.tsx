import { useId } from 'react';
import { Formik } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import css from './NoteForm.module.css';
import type { NoteTag } from '../../types/note';

interface NoteFormProps {
  onClose: () => void;
  onCreate: (payload: { title: string; content: string; tag: NoteTag }) => void;
  isSubmitting?: boolean;
}

interface FormValues {
  title: string;
  content: string;
  tag: NoteTag;
}

const initialValues: FormValues = {
  title: '',
  content: '',
  tag: 'Todo',
};

const schema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(50, 'Title is too long')
    .required('Title is required'),
  content: Yup.string()
    .max(500, 'Content is too long')
    .required('Content is required'),
  tag: Yup.mixed<NoteTag>()
    .oneOf(['Todo', 'Work', 'Personal', 'Meeting', 'Shopping'])
    .required('Tag is required'),
});

export default function NoteForm({
  onClose,
  onCreate,
  isSubmitting = false,
}: NoteFormProps) {
  const id = useId();

  const handleSubmit = (
    values: FormValues,
    actions: FormikHelpers<FormValues>
  ) => {
    onCreate({
      title: values.title.trim(),
      content: values.content.trim(),
      tag: values.tag,
    });

    actions.resetForm();
  };

  return (
    <Formik<FormValues>
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {formik => (
        <form className={css.form} onSubmit={formik.handleSubmit}>
          <div className={css.formGroup}>
            <label htmlFor={`${id}-title`}>Title</label>
            <input
              id={`${id}-title`}
              type="text"
              name="title"
              className={css.input}
              value={formik.values.title}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <span className={css.error}>
              {formik.touched.title ? formik.errors.title : ''}
            </span>
          </div>

          <div className={css.formGroup}>
            <label htmlFor={`${id}-content`}>Content</label>
            <textarea
              id={`${id}-content`}
              name="content"
              rows={8}
              className={css.textarea}
              value={formik.values.content}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <span className={css.error}>
              {formik.touched.content ? formik.errors.content : ''}
            </span>
          </div>

          <div className={css.formGroup}>
            <label htmlFor={`${id}-tag`}>Tag</label>
            <select
              id={`${id}-tag`}
              name="tag"
              className={css.select}
              value={formik.values.tag}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="Todo">Todo</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="Shopping">Shopping</option>
            </select>
            <span className={css.error}>
              {formik.touched.tag ? (formik.errors.tag as string) : ''}
            </span>
          </div>

          <div className={css.actions}>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting}
            >
              Create note
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Formik>
  );
}
