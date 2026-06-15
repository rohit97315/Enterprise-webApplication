import  { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { screenNewCandidate } from '../screenerSlice';

const ResumeView = () => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.screener);

    // Form pipeline states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [appliedRole, setAppliedRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [file, setFile] = useState(null);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please attach a candidate resume PDF.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('appliedRole', appliedRole);
        formData.append('jobDescription', jobDescription);
        formData.append('resume', file);

        dispatch(screenNewCandidate(formData));
        
        // Reset identity details, preserving JD context for batch processing
        setName('');
        setEmail('');
        setFile(null);
        setAppliedRole('')
        setJobDescription('')
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
            {/* Navbar Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white font-black tracking-wider text-xl">AI</div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">TalentMatch</h1>
                            <p className="text-xs text-zinc-400">Resume Screening & Ranking</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-950 text-blue-400 ring-1 ring-inset ring-blue-800/50">
                        Application Intake Active
                    </span>
                </div>
            </header>

            {/* Main Content Workspace Layout */}
            <main className="max-w-4xl mx-auto px-6 pt-10 pb-16">
                <section className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 md:p-8">
                    <h2 className="text-xl font-semibold text-white mb-1">Application Intake</h2>
                    <p className="text-sm text-zinc-400 mb-6">Analyze resume assets directly against customized functional descriptions.</p>
                    
                    <form onSubmit={handleFormSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Candidate Full Name</label>
                                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required 
                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none" />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                                <input type="email" placeholder="johndoe@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required 
                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Target Corporate Role</label>
                            <input type="text" placeholder="Frontend Architect (MERN / React)" value={appliedRole} onChange={(e) => setAppliedRole(e.target.value)} required 
                                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Job Description Matrix</label>
                            <textarea placeholder="Paste requirements, stack profiles, and expected core competencies..." rows="5" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} required 
                                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none resize-none" />
                        </div>

{/* Upload Drag & Drop Box */}
<div>
    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
        Upload Resume Documents
    </label>
    
    <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-800 border-dashed rounded-lg bg-zinc-950 hover:bg-zinc-900/60 transition-colors group cursor-pointer block">
        <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => setFile(e.target.files[0])} 
            className="sr-only" 
        />
        <div className="space-y-1 text-center pointer-events-none">
            <svg className="mx-auto h-12 w-12 text-zinc-600 group-hover:text-zinc-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20m-14-12V4a2 2 0 00-2-2h-8a2 2 0 00-2 2v4m14 4h-14m14 0l-4-4m4 4l-4 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-zinc-400 justify-center">
                <span className="font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                    Upload raw PDF file
                </span>
            </div>
            <p className="text-xs text-zinc-500">Strictly PDF formats supported</p>
            {file && (
                <p className="text-xs font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-1 rounded inline-block mt-2">
                    ✓ Selected: {file.name}
                </p>
            )}
        </div>
    </label>
</div>

                        <button type="submit" disabled={loading} 
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm tracking-wide text-white shadow-sm transition-all focus:outline-none
                            ${loading ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}>
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                                    <span>Parsing & Matrix Extraction Active...</span>
                                </div>
                            ) : 'Analyze Application Asset'}
                        </button>
                        
                        {error && (
                            <div className="p-3 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-xs rounded-md font-medium">
                                Error: {error}
                            </div>
                        )}
                    </form>
                </section>
            </main>
        </div>
    );
};

export default ResumeView;