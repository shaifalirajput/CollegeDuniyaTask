import React, { useState, useEffect, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './CollegeTable.css';

const CollegeTable = () => {
  const [colleges, setColleges] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const gridApi = useRef(null);

  useEffect(() => {
    fetch('colleges.json')
      .then(response => response.json())
      .then(data => {
        setColleges(data);
        setRowData(data.slice(0, itemsPerPage));
      });
  }, []);

  useEffect(() => {
    if (searchQuery !== '') {
      const filteredData = colleges.filter(college =>
        college.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRowData(filteredData.slice(0, itemsPerPage));
    } else {
      setRowData(colleges.slice(0, itemsPerPage));
    }
  }, [searchQuery, colleges]);

  useEffect(() => {
    setRowData(colleges.slice(0, currentPage * itemsPerPage));
  }, [currentPage, colleges]);

  const onGridReady = (params) => {
    gridApi.current = params.api;
    params.api.setDatasource(dataSource);
  };

  const dataSource = {
    getRows: (params) => {
      setTimeout(() => {
        const start = params.startRow;
        const end = params.endRow;
        const rowsThisPage = colleges.slice(start, end);
        const lastRow = colleges.length <= end ? colleges.length : -1;
        params.successCallback(rowsThisPage, lastRow);
        if (lastRow === -1 && colleges.length < itemsPerPage * currentPage) {
          loadMoreData();
        }
      }, 500);
    }
  };

  const loadMoreData = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  const onQuickFilterChanged = (event) => {
    setSearchQuery(event.target.value);
  };

  const currencyFormatter = (params) => {
    return `₹${params.value.toLocaleString()}`;
  };

  const columnDefs = [
    { field: 'rank', headerName: '#', sortable: true, cellClass: 'rank-cell' },
    {
      field: 'name', headerName: 'Colleges', sortable: true, cellRendererFramework: (params) => (
        <div className="college-cell">
          <h3>{params.data.name}</h3>
          <p>{params.data.location}</p>
          <p>{params.data.course}</p>
          {params.data.featured && <div className="featured">Featured</div>}
        </div>
      )
    },
    { field: 'fees', headerName: 'Course Fees', sortable: true, valueFormatter: currencyFormatter, cellClass: 'fees-cell' },
    { field: 'placement', headerName: 'Placement', sortable: true, valueFormatter: currencyFormatter, cellClass: 'placement-cell' },
    { field: 'userReview', headerName: 'User Reviews', sortable: true, cellClass: 'review-cell' },
    { field: 'ranking', headerName: 'Ranking', sortable: true, cellClass: 'ranking-cell' }
  ];

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={onQuickFilterChanged}
        placeholder="Search by college name"
        className="search-input"
      />

      <div className="ag-theme-alpine college-table">
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          animateRows={true}
          onGridReady={onGridReady}
          domLayout='autoHeight'
        />
      </div>
    </div>
  );
};

export default CollegeTable;
