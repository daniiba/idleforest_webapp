import Link from 'next/link';
import { FREE_TREE_RESOURCES } from '@/lib/free-tree-guide';

export default function FreeTreeResources({ currentPath }: { currentPath: string }) {
  return (
    <section aria-label="More about free tree planting" className="mx-auto my-12 max-w-4xl border-2 border-black bg-white p-6 text-black">
      <h2 className="text-2xl font-extrabold">Explore free tree planting</h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {FREE_TREE_RESOURCES.filter((resource) => resource.href !== currentPath).map((resource) => (
          <div key={resource.href}>
            <Link href={resource.href} className="font-bold underline decoration-2 underline-offset-4 hover:text-neutral-600">
              {resource.title}
            </Link>
            <p className="mt-2 text-sm leading-6 text-neutral-700">{resource.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
