import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import newRequest from "../../utils/newRequest";
import upload from "../../utils/upload";

export const STEPS = ["Overview", "Packages", "Extras", "Media", "Publish"];

export const INITIAL_STATE = {
  title: "", description: "", short_title: "", short_description: "",
  category: "", cover_image: "", images: [], requirements_prompt: "",
  packages: [
    { tier: "basic",    name: "", description: "", price: "", delivery_days: "", revision_number: 1, features: [] },
    { tier: "standard", name: "", description: "", price: "", delivery_days: "", revision_number: 2, features: [] },
    { tier: "premium",  name: "", description: "", price: "", delivery_days: "", revision_number: 3, features: [] },
  ],
  extras: [],
};

export const STEP_VALIDATORS = [
  (s) => {
    const errs = {};
    if (!s.title.trim())             errs.title = "Title is required.";
    if (!s.category)                 errs.category = "Category is required.";
    if (!s.description.trim())       errs.description = "Description is required.";
    if (!s.short_title.trim())       errs.short_title = "Short title is required.";
    if (!s.short_description.trim()) errs.short_description = "Short description is required.";
    return errs;
  },
  (s) => {
    const errs = {};
    const basic = s.packages.find(p => p.tier === "basic");
    if (!basic?.name?.trim())   errs.pkg_name  = "Basic package name is required.";
    if (!basic?.price)          errs.pkg_price = "Basic package price is required.";
    if (!basic?.delivery_days)  errs.pkg_days  = "Basic package delivery days are required.";
    return errs;
  },
  () => ({}),
  (s) => {
    const errs = {};
    if (!s.cover_image) errs.cover_image = "Please upload a cover image before continuing.";
    return errs;
  },
  () => ({}),
];

/** Maps an API gig response → form state shape */
function mapApiToForm(gig) {
  const tiers = ["basic", "standard", "premium"];
  const packages = tiers.map(tier => {
    const found = gig.packages?.find(p => p.tier === tier);
    return found
      ? { ...found, price: String(found.price), delivery_days: String(found.delivery_days), revision_number: found.revision_number }
      : INITIAL_STATE.packages.find(p => p.tier === tier);
  });

  return {
    title:                gig.title               ?? "",
    description:          gig.description         ?? "",
    short_title:          gig.short_title          ?? "",
    short_description:    gig.short_description    ?? "",
    category:             gig.category != null ? String(gig.category) : "",
    cover_image:          gig.cover_image          ?? "",
    images:               gig.images              ?? [],
    requirements_prompt:  gig.requirements_prompt  ?? "",
    packages,
    extras: (gig.extras ?? []).map(ex => ({
      name:        ex.name        ?? "",
      description: ex.description ?? "",
      price:       String(ex.price ?? ""),
      extra_days:  ex.extra_days  ?? 0,
    })),
  };
}

/**
 * useGigForm(slug)
 *   slug = undefined  →  "create" mode
 *   slug = "some-slug" →  "edit" mode
 */
export function useGigForm(slug) {
  const isEdit = !!slug;
  const { user } = useAuth();
  const draftKey = `add_gig_draft_${user?.id}`;

  const [step, setStep]               = useState(0);
  const [state, setState]             = useState(null);   // null = not yet initialised
  const [errors, setErrors]           = useState({});
  const [singleFile, setSingleFile]   = useState(undefined);
  const [files, setFiles]             = useState([]);
  const [uploading, setUploading]     = useState(false);
  const [featureInput, setFeatureInput] = useState({ basic: "", standard: "", premium: "" });
  const [extraInput, setExtraInput]   = useState({ name: "", description: "", price: "", extra_days: 0 });

  const navigate      = useNavigate();
  const queryClient   = useQueryClient();

  // ── Fetch existing gig (edit mode only) ──────────────────
  const { data: existingGig, isLoading: gigLoading } = useQuery({
    queryKey: ["gigManage", slug],
    queryFn:  () => newRequest.get(`/gigs/${slug}/manage/`).then(r => r.data),
    enabled:  isEdit,
  });

  // ── Categories ───────────────────────────────────────────
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn:  () => newRequest.get("/gigs/categories/").then(r => r.data.results ?? r.data),
  });

  // ── Initialise state ─────────────────────────────────────
  useEffect(() => {
    if (isEdit) {
      if (existingGig) setState(mapApiToForm(existingGig));
    } else {
      // try to restore a draft for new gigs only
      try {
        const saved = localStorage.getItem(draftKey);
        setState(saved ? JSON.parse(saved) : INITIAL_STATE);
      } catch {
        setState(INITIAL_STATE);
      }
    }
  }, [isEdit, existingGig]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist draft (create mode only) ─────────────────────
  useEffect(() => {
    if (!isEdit && state) {
      localStorage.setItem(draftKey, JSON.stringify(state));
    }
  }, [state, isEdit, draftKey]);

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
  };

  const goNext = () => {
    const errs = STEP_VALIDATORS[step](state);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
  };

  const goBack = () => setStep(s => s - 1);

  const handlePackageChange = (tier, field, value) =>
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p => p.tier === tier ? { ...p, [field]: value } : p),
    }));

  const addFeature = (tier) => {
    const val = featureInput[tier].trim();
    if (!val) return;
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, features: [...p.features, val] } : p
      ),
    }));
    setFeatureInput(prev => ({ ...prev, [tier]: "" }));
  };

  const removeFeature = (tier, feat) =>
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, features: p.features.filter(f => f !== feat) } : p
      ),
    }));

  const addExtra = () => {
    if (!extraInput.name || !extraInput.price) return;
    setState(prev => ({ ...prev, extras: [...prev.extras, { ...extraInput }] }));
    setExtraInput({ name: "", description: "", price: "", extra_days: 0 });
  };

  const removeExtra = (i) =>
    setState(prev => ({ ...prev, extras: prev.extras.filter((_, j) => j !== i) }));

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover_image = singleFile ? await upload(singleFile) : state.cover_image;
      const newImages   = files.length ? await Promise.all([...files].map(upload)) : state.images;
      setState(prev => ({ ...prev, cover_image, images: newImages }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ── Submit ───────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (payload) =>
      isEdit
        ? newRequest.patch(`/gigs/${slug}/manage/`, payload)
        : newRequest.post("/gigs/create/", payload),
    onSuccess: () => {
      if (!isEdit) localStorage.removeItem(draftKey);
      queryClient.invalidateQueries(["myGigs"]);
      navigate("/mygigs");
    },
  });

  const handleSubmit = () => {
    const payload = {
      ...state,
      category: state.category ? Number(state.category) : null,
      packages: state.packages
        .filter(p => p.name?.trim())
        .map(p => ({
          ...p,
          price:           Number(p.price),
          delivery_days:   Number(p.delivery_days),
          revision_number: Number(p.revision_number),
        })),
    };
    mutation.mutate(payload);
  };

  return {
    // meta
    isEdit, step, setStep, state, errors,
    gigLoading, categoriesData, mutation,
    // file state
    singleFile, setSingleFile, files, setFiles, uploading,
    // feature/extra inputs
    featureInput, setFeatureInput, extraInput, setExtraInput,
    // handlers
    handleChange, goNext, goBack,
    handlePackageChange, addFeature, removeFeature,
    addExtra, removeExtra, handleUpload, handleSubmit,
  };
}