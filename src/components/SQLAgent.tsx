import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Download, 
  Code, 
  Database, 
  Table,
  Search,
  Loader2
} from 'lucide-react';

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
}

interface DatabaseTable {
  id: string;
  name: string;
  schema: string;
  rowCount: number;
  columns: TableColumn[];
  sql: string;
}

const SQLAgent: React.FC = () => {
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [showingSql, setShowingSql] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockTables: DatabaseTable[] = [
      {
        id: '1',
        name: 'users',
        schema: 'public',
        rowCount: 1542,
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
          { name: 'email', type: 'VARCHAR(255)', nullable: false },
          { name: 'first_name', type: 'VARCHAR(100)', nullable: true },
          { name: 'last_name', type: 'VARCHAR(100)', nullable: true },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false },
        ],
        sql: 'CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  email VARCHAR(255) NOT NULL,\n  first_name VARCHAR(100),\n  last_name VARCHAR(100),\n  created_at TIMESTAMP NOT NULL\n);'
      },
      {
        id: '2',
        name: 'orders',
        schema: 'public',
        rowCount: 3847,
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
          { name: 'user_id', type: 'INTEGER', nullable: false },
          { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false },
          { name: 'status', type: 'VARCHAR(50)', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false },
        ],
        sql: 'CREATE TABLE orders (\n  id INTEGER PRIMARY KEY,\n  user_id INTEGER NOT NULL,\n  total_amount DECIMAL(10,2) NOT NULL,\n  status VARCHAR(50) NOT NULL,\n  created_at TIMESTAMP NOT NULL,\n  FOREIGN KEY (user_id) REFERENCES users(id)\n);'
      },
      {
        id: '3',
        name: 'products',
        schema: 'public',
        rowCount: 256,
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false, primaryKey: true },
          { name: 'name', type: 'VARCHAR(200)', nullable: false },
          { name: 'description', type: 'TEXT', nullable: true },
          { name: 'price', type: 'DECIMAL(8,2)', nullable: false },
          { name: 'stock_quantity', type: 'INTEGER', nullable: false },
        ],
        sql: 'CREATE TABLE products (\n  id INTEGER PRIMARY KEY,\n  name VARCHAR(200) NOT NULL,\n  description TEXT,\n  price DECIMAL(8,2) NOT NULL,\n  stock_quantity INTEGER NOT NULL\n);'
      }
    ];

    setTimeout(() => {
      setTables(mockTables);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleTableExpansion = (tableId: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableId)) {
      newExpanded.delete(tableId);
    } else {
      newExpanded.add(tableId);
    }
    setExpandedTables(newExpanded);
  };

  const toggleSqlView = (tableId: string) => {
    const newShowingSql = new Set(showingSql);
    if (newShowingSql.has(tableId)) {
      newShowingSql.delete(tableId);
    } else {
      newShowingSql.add(tableId);
    }
    setShowingSql(newShowingSql);
  };

  const handleDownload = (table: DatabaseTable) => {
    const csvContent = `Table: ${table.name}\nSchema: ${table.schema}\nRow Count: ${table.rowCount}\n\nColumns:\n${table.columns.map(col => `${col.name} (${col.type}${col.nullable ? ', nullable' : ', not null'}${col.primaryKey ? ', primary key' : ''})`).join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${table.name}_schema.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredTables = tables.filter(table =>
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.schema.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600 font-medium">Loading database tables...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Database Tables</h2>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {tables.length} tables
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="divide-y divide-gray-100">
        {filteredTables.map((table) => (
          <div key={table.id} className="hover:bg-gray-50 transition-colors duration-150">
            {/* Table Header */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleTableExpansion(table.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors duration-150"
                >
                  {expandedTables.has(table.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <Table className="w-5 h-5 text-gray-500" />
                <div>
                  <h3 className="font-medium text-gray-900">{table.name}</h3>
                  <p className="text-sm text-gray-500">
                    {table.schema} • {table.rowCount.toLocaleString()} rows
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleSqlView(table.id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-150"
                >
                  <Code className="w-4 h-4 mr-1.5" />
                  SQL
                </button>
                <button
                  onClick={() => handleDownload(table)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors duration-150"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedTables.has(table.id) && (
              <div className="px-6 pb-4 space-y-4">
                {/* SQL View - Now at the top */}
                {showingSql.has(table.id) && (
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">CREATE TABLE Statement</h4>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(table.sql);
                        }}
                        className="text-sm text-gray-300 hover:text-white transition-colors duration-150"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="text-sm text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {table.sql}
                    </pre>
                  </div>
                )}

                {/* Columns Table */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Columns ({table.columns.length})</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Name</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Constraints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {table.columns.map((column, index) => (
                          <tr key={index} className="hover:bg-white">
                            <td className="py-2 px-3 text-sm font-mono text-gray-900">{column.name}</td>
                            <td className="py-2 px-3 text-sm text-gray-600">{column.type}</td>
                            <td className="py-2 px-3 text-sm">
                              <div className="flex space-x-1">
                                {column.primaryKey && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    PK
                                  </span>
                                )}
                                {!column.nullable && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    NOT NULL
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="px-6 py-12 text-center">
          <Table className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tables found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default SQLAgent;