import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  IconButton,
  TableContainer,
  TablePagination,
  Container,
  Typography,
  TableRow,
  TableBody,
  TableCell,
  Button,
} from '@mui/material';

// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';

// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

import { getCommandebyClient, deleteCommande, updateCommande } from '../api/commande';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'no', label: 'No', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'delivery', label: 'Delivery', alignRight: false },
  { id: 'restaurant', label: 'Restaurant', alignRight: false },
  { id: 'state', label: 'State', alignRight: false },
  { id: 'totalprice', label: 'Total Price', alignRight: false },
  { id: 'deliverydate', label: 'Del Time', alignRight: false },
  { id: 'actions', label: 'Actions', alignRight: true },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  if (query) {
    const filteredArray = stabilizedThis.filter((item) => {
      const lowerQuery = query.toLowerCase();
      const lowerNo = item[0].no.toLowerCase();
      const lowerName = `${item[0].client.name} ${item[0].client.prenom}`.toLowerCase();
      return lowerNo.includes(lowerQuery) || lowerName.includes(lowerQuery);
    });
    return filteredArray.map((el) => el[0]);
  }

  return stabilizedThis.map((el) => el[0]);
}

export default function UserPage() {
  const client = JSON.parse(localStorage.getItem('client')); // Parse client data

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [commandes, setCommandes] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommandebyClient(client._id)
      .then((res) => {
        setCommandes(res.data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, [client._id]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = commandes.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };



  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - commandes.length) : 0;

  const filteredCommandes = applySortFilter(commandes, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredCommandes.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Orders Page </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Orders
          </Typography>
          <Link to="/dashboard/create-order">
            <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
              Add Order
            </Button>
          </Link>
        </Stack>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer component={Paper}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={commandes.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : isNotFound ? (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        No matching records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCommandes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((commande) => {
                        const formattedDate = format(new Date(commande.created_at), 'dd/MM/yyyy HH:mm:ss');
                        const formattedClientDate = commande.clientdate ? format(new Date(commande.clientdate), 'dd/MM/yyyy HH:mm:ss') : 'N/A';
                        const { _id, no, delivery, restaurant, state, totalprice, articles, menus } = commande;
                        const isItemSelected = selected.indexOf(_id) !== -1;

                        return (
                          <TableRow hover key={_id} tabIndex={-1} role="checkbox" selected={isItemSelected}>
                            <TableCell align="left">{no}</TableCell>
                            <TableCell align="left">{formattedDate}</TableCell>
                            <TableCell align="left">{delivery?.name || 'N/A'}</TableCell>
                            <TableCell align="left">{restaurant?.name || 'N/A'}</TableCell>
                            <TableCell align="left">{state}</TableCell>
                            <TableCell align="left">{totalprice} DZD</TableCell>
                            <TableCell align="left">{formattedClientDate}</TableCell>
                            <TableCell align="right">
                              <Link to="/dashboard/check-order" state={{
                                id: _id,
                                commande,
                                Delivery: delivery?.name || 'N/A',
                                Restaurant: restaurant?.name || 'N/A',
                                RestaurantAddress: restaurant?.adress || 'N/A',
                                State: state || 'N/A',
                                Totalprice: totalprice || 'N/A',
                                Articles: articles,
                                Menus: menus
                              }}>
                                <IconButton style={{ color: "purple" }}>
                                  <Iconify icon="iconoir:eye" width={20} height={20} />
                                </IconButton>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={10} />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={commandes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
