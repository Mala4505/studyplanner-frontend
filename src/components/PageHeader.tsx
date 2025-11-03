import { useEffect } from 'react'
export function PageHeader({ title }: { title: string }) {
  const newTitle = `${title} | Study Planner`
    useEffect(() => {
    document.title = newTitle;
  }, [newTitle]);
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {/* <div className="text-sm text-gray-400 mt-1">Admin / {title}</div> */}
    </div>
  );
}
