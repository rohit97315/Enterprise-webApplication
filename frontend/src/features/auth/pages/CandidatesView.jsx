import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidates,deleteCandidate } from '../screenerSlice';

const CandidatesView = () => {
    const dispatch = useDispatch();
    // Destructure with safe default fallbacks
    const { candidates = [], loading, error } = useSelector((state) => state.screener || {});

    useEffect(() => {
        dispatch(fetchCandidates());
    }, [dispatch]);


    const handleRemove = (id, name) => {
         const confirmed = window.confirm(`Remove ${name} from the candidate pipeline? This can't be undone.`);
         if (confirmed) {
             dispatch(deleteCandidate(id));
         }
     };


    // Helper utility tailored for dark-theme contrast scores
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
        if (score >= 50) return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
            {/* Navbar Header */}
            <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white font-black tracking-wider text-xl">AI</div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">TalentMatch</h1>
                            <p className="text-xs text-zinc-400">Resume Screening & Ranking</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 ring-1 ring-inset ring-zinc-700">
                        Reviewer Management Console
                    </span>
                </div>
            </header>

            {/* Main Content Ledger Layout */}
            <main className="max-w-5xl mx-auto px-6 py-10 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Ranked Score Engine Pipeline</h2>
                        <p className="text-sm text-zinc-400">Live evaluations dynamically indexed by descending AI matching quotients.</p>
                    </div>
                    <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold px-3 py-1.5 rounded-md text-xs self-start sm:self-auto">
                        Total Processed: {candidates?.length || 0}
                    </span>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12 text-zinc-500 text-sm">
                        <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
                        Fetching evaluations ledger...
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="p-4 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-sm rounded-lg font-medium">
                        Failed to load data: {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && (!candidates || candidates.length === 0) && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center text-zinc-500">
                        <p className="text-base font-medium text-zinc-400">No candidate evaluations recorded.</p>
                        <p className="text-xs text-zinc-500 mt-1">Pending incoming profile ingestion from the submission application portal.</p>
                    </div>
                )}

                {/* Data Present State */}
                {!loading && candidates && candidates.length > 0 && (
                    <div className="space-y-5">
                        {candidates.map((candidate) => (
                            <div key={candidate._id || candidate.email} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-lg transition-all rounded-xl p-6">
                                {/* Application Top Context Line */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-bold text-white">{candidate.name}</h3>
                                            <span className="text-xs font-medium text-zinc-400 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded">
                                                {candidate.appliedRole}
                                            </span>
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">{candidate.email}</p>
                                    </div>
                                    <div className={`text-xs font-black px-4 py-2 border rounded-full text-center tracking-wider shrink-0 ${getScoreColor(candidate.score)}`}>
                                        MATCH INDEX: {candidate.score}%
                                    </div>
                                    <button
                                 onClick={() => handleRemove(candidate._id, candidate.name)}
                                 className="text-xs font-semibold px-3 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-900/60 hover:bg-rose-950/20 transition-colors shrink-0"
                             >
                                 Remove
                             </button>
                                </div>

                                {/* Abstract Summary Analysis */}
                                {candidate.summary && (
                                    <div className="mt-4">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">AI Evaluation Matrix</h4>
                                        <p className="text-sm text-zinc-300 mt-1.5 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800/60">
                                            {candidate.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Core Mappings Grid Ecosystem */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                                    <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/30">
                                        <strong className="text-emerald-400 font-bold uppercase tracking-wide block mb-2.5">Verified Matches</strong>
                                        <ul className="space-y-1.5">
                                            {candidate.keyMatches && candidate.keyMatches.length > 0 ? (
                                                candidate.keyMatches.map((match, idx) => (
                                                    <li key={idx} className="text-emerald-300/90 flex items-start gap-2">
                                                        <span className="text-emerald-500 font-bold">✔</span>
                                                        <span>{match}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-zinc-500 italic">No exact match conditions listed.</li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="bg-rose-950/20 p-4 rounded-lg border border-rose-900/30">
                                        <strong className="text-rose-400 font-bold uppercase tracking-wide block mb-2.5">Identified Skill Gaps</strong>
                                        <ul className="space-y-1.5">
                                            {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
                                                candidate.missingSkills.map((gap, idx) => (
                                                    <li key={idx} className="text-rose-300/90 flex items-start gap-2">
                                                        <span className="text-rose-500 font-bold">✕</span>
                                                        <span>{gap}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-emerald-400 font-medium">No missing skills detected. Full overlap!</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CandidatesView;