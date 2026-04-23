import { useReducer, useState } from "react";
import './add.scss';
import upload from '../../utils/upload.js';
import { useQueryClient, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const INITIAL_STATE = {
  title: "", description: "", short_title: "", short_description: "",
  category: "", cover_image: "", images: [], requirements_prompt: "",
  packages: [
    { tier: "basic", name: "", description: "", price: "", delivery_days: "", revision_number: 1, features: [] },
    { tier: "standard", name: "", description: "", price: "", delivery_days: "", revision_number: 2, features: [] },
    { tier: "premium", name: "", description: "", price: "", delivery_days: "", revision_number: 3, features: [] },
  ],
  extras: [],
};

const Add = () => {
  const [state, setState] = useState(INITIAL_STATE);
  const [singleFile, setSingleFile] = useState(undefined);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [featureInput, setFeatureInput] = useState({ basic: '', standard: '', premium: '' });
  const [extraInput, setExtraInput] = useState({ name: '', description: '', price: '', extra_days: 0 });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleChange = (e) => {
    setState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePackageChange = (tier, field, value) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, [field]: value } : p
      )
    }));
  };

  const addFeature = (tier) => {
    const val = featureInput[tier].trim();
    if (!val) return;
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, features: [...p.features, val] } : p
      )
    }));
    setFeatureInput(prev => ({ ...prev, [tier]: '' }));
  };

  const removeFeature = (tier, feat) => {
    setState(prev => ({
      ...prev,
      packages: prev.packages.map(p =>
        p.tier === tier ? { ...p, features: p.features.filter(f => f !== feat) } : p
      )
    }));
  };

  const addExtra = () => {
    if (!extraInput.name || !extraInput.price) return;
    setState(prev => ({ ...prev, extras: [...prev.extras, { ...extraInput }] }));
    setExtraInput({ name: '', description: '', price: '', extra_days: 0 });
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const cover_image = await upload(singleFile);
      const images = await Promise.all([...files].map(upload));
      setState(prev => ({ ...prev, cover_image, images }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: (gig) => newRequest.post("/gigs/create/", gig),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      navigate('/mygigs');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(state);
  };

  const tiers = ['basic', 'standard', 'premium'];

  return (
    <div className="add">
      <div className="container">
        <h1>Add New Gig</h1>

        <div className="sections">
          <div className="left">
            <label>Title</label>
            <input name="title" placeholder="e.g. I will write your research paper" onChange={handleChange} />

            <label>Category</label>
            <input name="category" placeholder="Category ID (from /api/gigs/categories/)" onChange={handleChange} />

            <label>Description</label>
            <textarea name="description" rows={8} onChange={handleChange} />

            <label>Requirements Prompt</label>
            <textarea
              name="requirements_prompt"
              rows={4}
              placeholder="What do you need from the student before starting? e.g. Please provide: 1) Rubric 2) Citation style 3) Word count"
              onChange={handleChange}
            />

            <div className="images">
              <label>Cover Image</label>
              <input type="file" onChange={e => setSingleFile(e.target.files[0])} />
              <label>Gallery Images</label>
              <input type="file" multiple onChange={e => setFiles(e.target.files)} />
              <button type="button" onClick={handleUpload}>
                {uploading ? "Uploading…" : "Upload Images"}
              </button>
            </div>
          </div>

          <div className="right">
            <label>Short Title</label>
            <input name="short_title" onChange={handleChange} />
            <label>Short Description</label>
            <textarea name="short_description" rows={3} onChange={handleChange} />

            {/* Package builder */}
            <h3 style={{ marginTop: 24 }}>Packages</h3>
            {tiers.map(tier => {
              const pkg = state.packages.find(p => p.tier === tier);
              return (
                <div key={tier} className={`package-builder package-builder--${tier}`}>
                  <h4>{tier.charAt(0).toUpperCase() + tier.slice(1)}</h4>
                  <input placeholder="Package name" value={pkg.name}
                    onChange={e => handlePackageChange(tier, 'name', e.target.value)} />
                  <textarea placeholder="What's included" rows={2} value={pkg.description}
                    onChange={e => handlePackageChange(tier, 'description', e.target.value)} />
                  <input type="number" placeholder="Price ($)" value={pkg.price}
                    onChange={e => handlePackageChange(tier, 'price', e.target.value)} />
                  <input type="number" placeholder="Delivery days" value={pkg.delivery_days}
                    onChange={e => handlePackageChange(tier, 'delivery_days', e.target.value)} />
                  <input type="number" placeholder="Revisions" value={pkg.revision_number}
                    onChange={e => handlePackageChange(tier, 'revision_number', e.target.value)} />
                  <div className="feature-input">
                    <input
                      placeholder="Add a feature"
                      value={featureInput[tier]}
                      onChange={e => setFeatureInput(prev => ({ ...prev, [tier]: e.target.value }))}
                    />
                    <button type="button" onClick={() => addFeature(tier)}>+</button>
                  </div>
                  <ul>
                    {pkg.features.map(f => (
                      <li key={f}>{f} <span onClick={() => removeFeature(tier, f)}>✕</span></li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* Extras builder */}
            <h3 style={{ marginTop: 24 }}>Add-ons (Extras)</h3>
            <div className="extra-builder">
              <input placeholder="Name (e.g. 24-hour turnaround)" value={extraInput.name}
                onChange={e => setExtraInput(prev => ({ ...prev, name: e.target.value }))} />
              <input placeholder="Description" value={extraInput.description}
                onChange={e => setExtraInput(prev => ({ ...prev, description: e.target.value }))} />
              <input type="number" placeholder="Price ($)" value={extraInput.price}
                onChange={e => setExtraInput(prev => ({ ...prev, price: e.target.value }))} />
              <input type="number" placeholder="Extra days" value={extraInput.extra_days}
                onChange={e => setExtraInput(prev => ({ ...prev, extra_days: e.target.value }))} />
              <button type="button" onClick={addExtra}>Add Extra</button>
            </div>
            {state.extras.map((ex, i) => (
              <div key={i} className="extra-tag">
                {ex.name} — ${ex.price} (+{ex.extra_days}d)
                <span onClick={() => setState(prev => ({
                  ...prev, extras: prev.extras.filter((_, j) => j !== i)
                }))}>✕</span>
              </div>
            ))}

            <button className="submit-btn" onClick={handleSubmit}>
              {mutation.isLoading ? "Creating…" : "Create Gig"}
            </button>
            {mutation.isError && <p style={{ color: 'red' }}>Failed to create gig. Please try again.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Add;