import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, BookOpen } from 'lucide-react';
import { ScheduledBlock, Tag } from '../types';
import { tagColorMap } from '../constants';
import { updateBlockTag } from '../api/schedule';
import { toast } from 'react-toastify';

interface StudyBlockProps {
  session: ScheduledBlock;
  tags: Tag[];
  onRefresh?: () => void;
  onLocalTagUpdate?: (blockId: string, newTag: Tag) => void;
}

export function StudyBlock({ session, tags, onRefresh, onLocalTagUpdate }: StudyBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session }
  });

  const [selectedTag, setSelectedTag] = useState<string>(
    session.tag?.name || session.bookTag?.name || ''
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Sync selectedTag when session updates
  useEffect(() => {
    const hydratedName = session.tag?.name || session.bookTag?.name || '';
    setSelectedTag(hydratedName);
  }, [session.tag?.name, session.bookTag?.name]);

  const tagMap = Object.fromEntries(tags.map(tag => [tag.name, tag]));
  const color = tagMap[selectedTag]?.color || session.color || '#888';
  const blockTags = tags.filter(tag => tag.is_block_only);

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Spinner overlay */}
      {isSaving && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm rounded-md">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white border-opacity-50"></div>
        </div>
      )}

      {/* Drag handle zone */}
      <div
        className="absolute top-2 left-2 z-10 cursor-grab pointer-events-auto"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Block content */}
      <div
        className="rounded-md p-2 text-xs border border-border hover:shadow-md transition-shadow pointer-events-auto"
        style={{
          backgroundColor: `${color}20`,
          borderLeftColor: color,
          borderLeftWidth: '3px'
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="font-medium truncate flex items-center gap-1">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            <p className="text-accent ">{session.book_title}</p>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsEditing(prev => !prev);
              }}
              className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-gray-700 text-white pointer-events-auto"
              title="Click to change tag"
            >
              {selectedTag || 'No Tag'}
            </button>
          </div>

          <div className="text-muted-foreground">
            Pages {session.page_start}–{session.page_end}
          </div>

          {isEditing && (
            <div
              className="mt-1 flex flex-wrap gap-1"
              onClick={e => e.stopPropagation()}
            >
              {blockTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={async e => {
                    e.stopPropagation();
                    setSelectedTag(tag.name);
                    setIsEditing(false);
                    setIsSaving(true);

                    const blockId = session.id.replace(/^session-/, '');

                    // ✅ Optimistically update parent state
                    onLocalTagUpdate?.(blockId, tag);

                    try {
                      await updateBlockTag(blockId, tag.id);
                      toast.success(`Tag updated to "${tag.name}"`);
                      onRefresh?.();
                    } catch (err) {
                      console.error('Failed to update tag:', err);
                      toast.error('Failed to update tag');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium pointer-events-auto ${selectedTag === tag.name ? 'bg-white text-black' : 'bg-gray-700 text-white'
                    }`}
                  style={{ border: `2px solid ${tag.color}` }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
