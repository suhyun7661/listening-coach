import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClipEditor from '../components/ClipEditor';
import { AdminGate } from './Admin';
import * as adminApi from '../lib/adminApi';
import { draftFromClip, emptyDraft } from '../lib/adminClip';
import { getClip, getClips } from '../lib/clipStore';
import { useClips } from '../lib/ClipsProvider';

// /admin/new and /admin/edit/:id
export default function AdminClip() {
  return (
    <AdminGate>
      <Editor />
    </AdminGate>
  );
}

function Editor() {
  const { id } = useParams();
  const { reloadClips } = useClips();
  const clip = id ? getClip(id) : null;
  const takenIds = useMemo(() => getClips().map((c) => c.id), []);

  if (id && !clip) {
    return (
      <div className="page page--narrow">
        <h1 className="page__title">Clip not found</h1>
        <Link to="/admin" className="btn btn--primary">Back to the clip list</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/admin" className="back-link">‹ Back to the clip list</Link>
      <h1 className="page__title">{clip ? `Edit: ${clip.title}` : 'Add a clip'}</h1>
      <ClipEditor
        initial={clip ? draftFromClip(clip) : emptyDraft()}
        isNew={!clip}
        takenIds={takenIds}
        previousSentenceIds={clip ? clip.sentences.map((s) => s.id) : []}
        api={adminApi}
        onSaved={reloadClips}
      />
    </div>
  );
}
