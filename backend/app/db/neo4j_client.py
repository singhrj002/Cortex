"""
Neo4j database client and connection management.
Provides connection pooling and query execution utilities.
"""

import logging
from typing import Dict, List, Any, Optional
from neo4j import GraphDatabase, Driver, Session as Neo4jSession
from contextlib import contextmanager

from app.core.config import settings

logger = logging.getLogger(__name__)


class Neo4jClient:
    """
    Neo4j database client with connection pooling.
    Singleton pattern to ensure one driver instance.
    """

    _instance: Optional['Neo4jClient'] = None
    _driver: Optional[Driver] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Neo4jClient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize Neo4j driver if not already initialized."""
        if self._driver is None:
            self.connect()

    def connect(self):
        """Establish connection to Neo4j database."""
        try:
            self._driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                max_connection_lifetime=3600,
                max_connection_pool_size=50,
                connection_acquisition_timeout=120
            )
            # Test connection
            self._driver.verify_connectivity()
            logger.info(f"Connected to Neo4j at {settings.NEO4J_URI}")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise

    @contextmanager
    def get_session(self) -> Neo4jSession:
        """
        Context manager for Neo4j session.

        Usage:
            with client.get_session() as session:
                result = session.run(query, params)
        """
        session = self._driver.session()
        try:
            yield session
        finally:
            session.close()

    def execute_read(self, query: str, parameters: Optional[Dict] = None) -> List[Dict]:
        """
        Execute a read query and return results.

        Args:
            query: Cypher query string
            parameters: Query parameters

        Returns:
            List of result records as dictionaries
        """
        with self.get_session() as session:
            result = session.run(query, parameters or {})
            return [dict(record) for record in result]

    def execute_write(self, query: str, parameters: Optional[Dict] = None) -> List[Dict]:
        """
        Execute a write query and return results.

        Args:
            query: Cypher query string
            parameters: Query parameters

        Returns:
            List of result records as dictionaries
        """
        with self.get_session() as session:
            result = session.run(query, parameters or {})
            return [dict(record) for record in result]

    def execute_transaction(self, queries: List[tuple]) -> bool:
        """
        Execute multiple queries in a single transaction.

        Args:
            queries: List of (query, parameters) tuples

        Returns:
            True if successful, False otherwise
        """
        with self.get_session() as session:
            try:
                with session.begin_transaction() as tx:
                    for query, params in queries:
                        tx.run(query, params or {})
                    tx.commit()
                return True
            except Exception as e:
                logger.error(f"Transaction failed: {e}")
                return False

    def create_indexes(self):
        """Create indexes for optimal query performance."""
        indexes = [
            # Person indexes
            "CREATE INDEX person_email IF NOT EXISTS FOR (p:Person) ON (p.email)",
            "CREATE INDEX person_name IF NOT EXISTS FOR (p:Person) ON (p.name)",

            # Decision indexes
            "CREATE INDEX decision_key IF NOT EXISTS FOR (d:Decision) ON (d.decision_key)",
            "CREATE INDEX decision_status IF NOT EXISTS FOR (d:Decision) ON (d.status)",
            "CREATE INDEX decision_version IF NOT EXISTS FOR (d:Decision) ON (d.version)",
            "CREATE INDEX decision_valid IF NOT EXISTS FOR (d:Decision) ON (d.valid_to)",

            # Task indexes
            "CREATE INDEX task_status IF NOT EXISTS FOR (t:Task) ON (t.status)",
            "CREATE INDEX task_assignee IF NOT EXISTS FOR (t:Task) ON (t.assignee_email)",

            # Claim indexes
            "CREATE INDEX claim_key IF NOT EXISTS FOR (c:Claim) ON (c.claim_key)",

            # Topic indexes
            "CREATE INDEX topic_name IF NOT EXISTS FOR (t:Topic) ON (t.name)",

            # Event indexes
            "CREATE INDEX event_timestamp IF NOT EXISTS FOR (e:Event) ON (e.timestamp)",
            "CREATE INDEX event_source IF NOT EXISTS FOR (e:Event) ON (e.source)",
        ]

        for index_query in indexes:
            try:
                self.execute_write(index_query)
                logger.info(f"Created index: {index_query.split()[2]}")
            except Exception as e:
                logger.warning(f"Index creation failed (may already exist): {e}")

    def create_constraints(self):
        """Create uniqueness constraints."""
        constraints = [
            "CREATE CONSTRAINT person_email_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.email IS UNIQUE",
            "CREATE CONSTRAINT topic_name_unique IF NOT EXISTS FOR (t:Topic) REQUIRE t.name IS UNIQUE",
        ]

        for constraint_query in constraints:
            try:
                self.execute_write(constraint_query)
                logger.info(f"Created constraint: {constraint_query.split()[2]}")
            except Exception as e:
                logger.warning(f"Constraint creation failed (may already exist): {e}")

    def clear_database(self):
        """
        Clear all nodes and relationships.
        WARNING: Use only for testing/development!
        """
        query = "MATCH (n) DETACH DELETE n"
        self.execute_write(query)
        logger.warning("Cleared all data from Neo4j database")

    def get_stats(self) -> Dict[str, int]:
        """Get database statistics."""
        queries = {
            "nodes": "MATCH (n) RETURN count(n) as count",
            "relationships": "MATCH ()-[r]->() RETURN count(r) as count",
            "persons": "MATCH (p:Person) RETURN count(p) as count",
            "decisions": "MATCH (d:Decision) RETURN count(d) as count",
            "tasks": "MATCH (t:Task) RETURN count(t) as count",
            "claims": "MATCH (c:Claim) RETURN count(c) as count",
            "topics": "MATCH (t:Topic) RETURN count(t) as count",
        }

        stats = {}
        for key, query in queries.items():
            result = self.execute_read(query)
            stats[key] = result[0]["count"] if result else 0

        return stats

    def close(self):
        """Close Neo4j driver connection."""
        if self._driver:
            self._driver.close()
            logger.info("Neo4j connection closed")


# Global client instance
_neo4j_client: Optional[Neo4jClient] = None


def get_neo4j_client() -> Neo4jClient:
    """Get or create Neo4j client instance."""
    global _neo4j_client
    if _neo4j_client is None:
        _neo4j_client = Neo4jClient()
    return _neo4j_client


def close_neo4j_connection():
    """Close global Neo4j connection."""
    global _neo4j_client
    if _neo4j_client:
        _neo4j_client.close()
        _neo4j_client = None
