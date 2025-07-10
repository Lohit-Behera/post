import { useAppDispatch } from "@/redux/store";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { type AsyncThunk } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

interface ToastOptions<TResult> {
  loadingMessage?: string;
  getSuccessMessage?: (data: TResult) => string;
  getErrorMessage?: (error: unknown) => string;
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

interface AsyncDispatchOptions<TResult> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: AxiosError) => void;
}

export const useDispatchWithToast = <
  TData extends void | unknown = void,
  TResult = void
>(
  asyncThunkAction: AsyncThunk<TResult, TData, any>,
  options: ToastOptions<TResult> = {}
) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    loadingMessage = "Loading...",
    getSuccessMessage = (data: TResult) =>
      (data as any)?.message || "Operation successful",
    getErrorMessage = (error: unknown) =>
      (error as Error)?.message || "Operation failed",
    onSuccess,
    onError,
  } = options;

  return async (data?: TData | any): Promise<TResult> => {
    const promise = dispatch(asyncThunkAction(data)).unwrap();

    toast.promise(promise, {
      loading: loadingMessage,
      success: (result: TResult) => {
        onSuccess?.(result);
        return getSuccessMessage(result);
      },
      error: (err: unknown) => {
        if (
          err === "Refresh token expired" ||
          err === "Session expired" ||
          err === "Invalid token: User not found"
        ) {
          toast.error("Session expired. Please log in again.");
          navigate("/session-expired");
        }
        onError?.(err);
        return getErrorMessage(err);
      },
    });

    return promise;
  };
};

export const useAsyncDispatch = <
  TData extends void | unknown = void,
  TResult = void
>(
  asyncThunkAction: AsyncThunk<TResult, TData, any>,
  options: AsyncDispatchOptions<TResult> = {}
) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { onSuccess, onError } = options;

  return async (data?: TData | any): Promise<TResult> => {
    try {
      const result = await dispatch(asyncThunkAction(data)).unwrap();
      onSuccess?.(result);
      return result;
    } catch (error) {
      if (
        error === "Refresh token expired" ||
        error === "Session expired" ||
        error === "Invalid token: User not found"
      ) {
        toast.error("Session expired. Please log in again.");
        navigate("/session-expired");
      }
      if (onError && error instanceof Error) {
        onError(error as AxiosError);
      }
      throw error;
    }
  };
};
