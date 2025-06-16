import { Link } from "wouter";

const quickActions = [
  {
    href: "/compose",
    icon: "fas fa-edit",
    title: "Create Post",
    description: "Compose new content",
    color: "text-primary-500",
  },
  {
    href: "/calendar",
    icon: "fas fa-calendar-plus",
    title: "Schedule Post",
    description: "Plan your content",
    color: "text-green-500",
  },
  {
    href: "/automations",
    icon: "fas fa-robot",
    title: "Create Automation",
    description: "Set up workflows",
    color: "text-yellow-500",
  },
  {
    href: "/analytics",
    icon: "fas fa-chart-line",
    title: "View Analytics",
    description: "Check performance",
    color: "text-blue-500",
  },
];

export default function QuickActions() {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <button className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300">
          View All
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow text-left block cursor-pointer">
              <i className={`${action.icon} ${action.color} text-xl mb-2 block`}></i>
              <h3 className="font-medium text-gray-900 dark:text-white">{action.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
